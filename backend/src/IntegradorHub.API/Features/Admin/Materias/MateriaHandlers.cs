using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;
using Google.Cloud.Firestore;

namespace IntegradorHub.API.Features.Admin.Materias;

// === COMMAND: Create Materia ===
public record CreateMateriaCommand(
    string Nombre,
    string Clave,
    int Cuatrimestre
) : IRequest<CreateMateriaResponse>;

public record CreateMateriaResponse(bool Success, string Message, string? MateriaId);

public class CreateMateriaHandler : IRequestHandler<CreateMateriaCommand, CreateMateriaResponse>
{
    private readonly IMateriaRepository _materiaRepository;

    public CreateMateriaHandler(IMateriaRepository materiaRepository)
    {
        _materiaRepository = materiaRepository;
    }

    public async Task<CreateMateriaResponse> Handle(CreateMateriaCommand request, CancellationToken cancellationToken)
    {
        var materia = new Materia
        {
            Nombre = request.Nombre,
            Clave = request.Clave,
            Cuatrimestre = request.Cuatrimestre,
            IsActive = true,
            CreatedAt = Timestamp.GetCurrentTimestamp()
        };

        await _materiaRepository.CreateAsync(materia);

        return new CreateMateriaResponse(true, "Materia creada correctamente", materia.Id);
    }
}

// === QUERY: Get All Materias ===
public record GetAllMateriasQuery() : IRequest<IEnumerable<MateriaDto>>;

public record MateriaDto(
    string Id,
    string Nombre,
    string Clave,
    int Cuatrimestre,
    bool IsActive
);

public class GetAllMateriasHandler : IRequestHandler<GetAllMateriasQuery, IEnumerable<MateriaDto>>
{
    private readonly IMateriaRepository _materiaRepository;

    public GetAllMateriasHandler(IMateriaRepository materiaRepository)
    {
        _materiaRepository = materiaRepository;
    }

    public async Task<IEnumerable<MateriaDto>> Handle(GetAllMateriasQuery request, CancellationToken cancellationToken)
    {
        var materias = await _materiaRepository.GetAllActiveAsync();
        return materias.Select(m => new MateriaDto(
            m.Id,
            m.Nombre,
            m.Clave,
            m.Cuatrimestre,
            m.IsActive
        ));
    }
}

// === COMMAND: Update Materia ===
public record UpdateMateriaCommand(
    string Id,
    string? Nombre,
    string? Clave,
    int? Cuatrimestre,
    bool? IsActive
) : IRequest<UpdateMateriaResponse>;

public record UpdateMateriaResponse(bool Success, string Message);

public class UpdateMateriaHandler : IRequestHandler<UpdateMateriaCommand, UpdateMateriaResponse>
{
    private readonly IMateriaRepository _materiaRepository;

    public UpdateMateriaHandler(IMateriaRepository materiaRepository)
    {
        _materiaRepository = materiaRepository;
    }

    public async Task<UpdateMateriaResponse> Handle(UpdateMateriaCommand request, CancellationToken cancellationToken)
    {
        var materia = await _materiaRepository.GetByIdAsync(request.Id);
        if (materia == null)
            return new UpdateMateriaResponse(false, "Materia no encontrada");

        materia.Nombre = request.Nombre ?? materia.Nombre;
        materia.Clave = request.Clave ?? materia.Clave;
        materia.Cuatrimestre = request.Cuatrimestre ?? materia.Cuatrimestre;
        materia.IsActive = request.IsActive ?? materia.IsActive;

        await _materiaRepository.UpdateAsync(materia);

        return new UpdateMateriaResponse(true, "Materia actualizada");
    }
}

// === COMMAND: Delete (deactivate) Materia ===
public record DeleteMateriaCommand(string Id) : IRequest<DeleteMateriaResponse>;

public record DeleteMateriaResponse(bool Success, string Message);

public class DeleteMateriaHandler : IRequestHandler<DeleteMateriaCommand, DeleteMateriaResponse>
{
    private readonly IMateriaRepository _materiaRepository;

    public DeleteMateriaHandler(IMateriaRepository materiaRepository)
    {
        _materiaRepository = materiaRepository;
    }

    public async Task<DeleteMateriaResponse> Handle(DeleteMateriaCommand request, CancellationToken cancellationToken)
    {
        var materia = await _materiaRepository.GetByIdAsync(request.Id);
        if (materia == null)
            return new DeleteMateriaResponse(false, "Materia no encontrada");

        materia.IsActive = false;
        await _materiaRepository.UpdateAsync(materia);

        return new DeleteMateriaResponse(true, "Materia desactivada");
    }
}
