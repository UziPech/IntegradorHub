using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;

namespace IntegradorHub.API.Features.Projects.GetDetails;

// === QUERY ===
public record GetProjectDetailsQuery(string ProjectId) : IRequest<ProjectDetailsDto>;

// === HANDLER ===
public class GetProjectDetailsHandler : IRequestHandler<GetProjectDetailsQuery, ProjectDetailsDto>
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;

    public GetProjectDetailsHandler(IProjectRepository projectRepository, IUserRepository userRepository)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
    }

    public async Task<ProjectDetailsDto> Handle(GetProjectDetailsQuery request, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(request.ProjectId);
        if (project == null) throw new KeyNotFoundException("Proyecto no encontrado");

        var members = new List<MemberDto>();
        if (project.MiembrosIds != null)
        {
            foreach (var memberId in project.MiembrosIds)
            {
                var user = await _userRepository.GetByIdAsync(memberId);
                if (user != null)
                {
                    members.Add(new MemberDto(
                        user.Id,
                        user.Nombre,
                        user.Email,
                        user.FotoUrl,
                        memberId == project.LiderId ? "Líder" : "Miembro"
                    ));
                }
            }
        }

        return new ProjectDetailsDto(
            project.Id,
            project.Titulo,
            project.Materia,
            project.MateriaId,
            project.Ciclo,
            project.Estado,
            project.LiderId,
            project.MiembrosIds ?? new List<string>(),
            project.StackTecnologico,
            project.RepositorioUrl,
            project.CanvasBlocks,
            members,
            project.CreatedAt.ToDateTime()
        );
    }
}

public record ProjectDetailsDto(
    string Id,
    string Titulo,
    string Materia,
    string MateriaId,
    string Ciclo,
    string Estado,
    string LiderId,
    List<string> MiembrosIds,
    List<string> StackTecnologico,
    string? RepositorioUrl,
    List<CanvasBlock> Canvas,
    List<MemberDto> Members,
    DateTime CreatedAt
);

public record MemberDto(string Id, string Nombre, string Email, string? FotoUrl, string Rol);
