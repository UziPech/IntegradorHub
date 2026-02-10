using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;

namespace IntegradorHub.API.Features.Teams.GetAvailableTeachers;

public record GetAvailableTeachersQuery(string GroupId) : IRequest<List<TeacherDto>>;

public record TeacherDto(string Id, string NombreCompleto, string Profesion, string Carrera, string Asignatura, string? MateriaId);

public class GetAvailableTeachersHandler : IRequestHandler<GetAvailableTeachersQuery, List<TeacherDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMateriaRepository _materiaRepository;

    public GetAvailableTeachersHandler(IUserRepository userRepository, IMateriaRepository materiaRepository)
    {
        _userRepository = userRepository;
        _materiaRepository = materiaRepository;
    }

    public async Task<List<TeacherDto>> Handle(GetAvailableTeachersQuery request, CancellationToken cancellationToken)
    {
        var teachersInGroup = await _userRepository.GetTeachersByGroupAsync(request.GroupId);
        var materias = await _materiaRepository.GetAllActiveAsync();
        var materiasMap = materias.ToDictionary(m => m.Id, m => m.Nombre);

        var availableTeachers = teachersInGroup
            .Select(u => {
                // Encontrar la asignación relevante para este grupo para mostrar la materia
                var asignacion = u.Asignaciones?.FirstOrDefault(a => a.GruposIds.Contains(request.GroupId));
                
                var materiaNombre = "Docente";
                if (asignacion != null && materiasMap.TryGetValue(asignacion.MateriaId, out var nombre))
                {
                    materiaNombre = nombre;
                }
                
                return new TeacherDto(
                    u.Id,
                    $"{u.Nombre} {u.ApellidoPaterno} {u.ApellidoMaterno}".Trim(),
                    u.Profesion ?? "Docente",
                    asignacion?.CarreraId ?? "", 
                    materiaNombre,
                    asignacion?.MateriaId
                );
            })
            .ToList();

        return availableTeachers;
    }
}
