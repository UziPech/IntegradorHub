using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;
using Google.Cloud.Firestore;

namespace IntegradorHub.API.Features.Evaluations.Create;

// === COMMAND ===
public record CreateEvaluationCommand(
    string ProjectId,
    string DocenteId,
    string DocenteNombre,
    string Tipo,          // "oficial" | "sugerencia"
    string Contenido,
    int? Calificacion     // Solo para tipo "oficial", 0-100
) : IRequest<CreateEvaluationResponse>;

public record CreateEvaluationResponse(bool Success, string Message, string? EvaluationId);

// === HANDLER ===
public class CreateEvaluationHandler : IRequestHandler<CreateEvaluationCommand, CreateEvaluationResponse>
{
    private readonly IEvaluationRepository _evaluationRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMateriaRepository _materiaRepository;

    public CreateEvaluationHandler(
        IEvaluationRepository evaluationRepository,
        IProjectRepository projectRepository,
        IUserRepository userRepository,
        IMateriaRepository materiaRepository)
    {
        _evaluationRepository = evaluationRepository;
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _materiaRepository = materiaRepository;
    }

    public async Task<CreateEvaluationResponse> Handle(CreateEvaluationCommand request, CancellationToken cancellationToken)
    {
        // Validar que el proyecto existe
        var project = await _projectRepository.GetByIdAsync(request.ProjectId);
        if (project == null)
            throw new KeyNotFoundException("Proyecto no encontrado");

        // Validar que el docente existe y es docente
        var docente = await _userRepository.GetByIdAsync(request.DocenteId);
        if (docente == null || docente.Rol != "Docente")
            throw new UnauthorizedAccessException("Solo los docentes pueden evaluar proyectos");

        // Validar tipo
        if (request.Tipo != "oficial" && request.Tipo != "sugerencia")
            throw new ArgumentException("Tipo de evaluación inválido. Debe ser 'oficial' o 'sugerencia'");

        // Validar calificación si es oficial
        if (request.Tipo == "oficial")
        {
            bool isTitular = project.DocenteId == request.DocenteId;
            bool isHighPriority = false;

            if (!isTitular)
            {
                // Verificar si el docente tiene alguna materia de Alta Prioridad
                if (docente.Asignaciones != null)
                {
                    foreach (var asignacion in docente.Asignaciones)
                    {
                        if (!string.IsNullOrEmpty(asignacion.MateriaId))
                        {
                            var materia = await _materiaRepository.GetByIdAsync(asignacion.MateriaId);
                            if (materia != null && materia.EsAltaPrioridad)
                            {
                                isHighPriority = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (!isTitular && !isHighPriority)
                throw new UnauthorizedAccessException("Solo el docente titular o asesores con materias prioritarias pueden realizar evaluaciones oficiales.");

            if (!request.Calificacion.HasValue || request.Calificacion < 0 || request.Calificacion > 100)
                throw new ArgumentException("Las evaluaciones oficiales requieren una calificación entre 0 y 100");
        }

        // Crear evaluación
        var evaluation = new Evaluation
        {
            ProjectId = request.ProjectId,
            DocenteId = request.DocenteId,
            DocenteNombre = request.DocenteNombre,
            Tipo = request.Tipo,
            Contenido = request.Contenido,
            Calificacion = request.Tipo == "oficial" ? request.Calificacion : null
        };

        await _evaluationRepository.CreateAsync(evaluation);

        return new CreateEvaluationResponse(true, "Evaluación creada correctamente", evaluation.Id);
    }
}
