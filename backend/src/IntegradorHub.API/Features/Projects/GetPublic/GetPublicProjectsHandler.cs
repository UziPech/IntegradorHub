using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;

namespace IntegradorHub.API.Features.Projects.GetPublic;

// === QUERY ===
public record GetPublicProjectsQuery() : IRequest<IEnumerable<PublicProjectDto>>;

public record PublicProjectDto(
    string Id,
    string Titulo,
    string Materia,
    string Ciclo,
    List<string> StackTecnologico,
    string? ThumbnailUrl,
    string? RepositorioUrl,
    string? DemoUrl,
    string LiderNombre,
    int MembersCount,
    DateTime CreatedAt
);

// === HANDLER ===
public class GetPublicProjectsHandler : IRequestHandler<GetPublicProjectsQuery, IEnumerable<PublicProjectDto>>
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;

    public GetPublicProjectsHandler(IProjectRepository projectRepository, IUserRepository userRepository)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<PublicProjectDto>> Handle(GetPublicProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _projectRepository.GetPublicProjectsAsync();

        var result = new List<PublicProjectDto>();
        foreach (var project in projects)
        {
            var leader = await _userRepository.GetByIdAsync(project.LiderId);
            
            result.Add(new PublicProjectDto(
                project.Id,
                project.Titulo,
                project.Materia,
                project.Ciclo,
                project.StackTecnologico,
                project.ThumbnailUrl,
                project.RepositorioUrl,
                project.DemoUrl,
                leader?.Nombre ?? "Desconocido",
                project.MiembrosIds.Count + 1, // +1 for leader
                project.CreatedAt.ToDateTime()
            ));
        }

        return result.OrderByDescending(p => p.CreatedAt);
    }
}
