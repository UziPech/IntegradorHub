using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;

namespace IntegradorHub.API.Features.Projects.GetDetails;

// === QUERY ===
public record GetProjectDetailsQuery(string ProjectId) : IRequest<ProjectDetailsDto>;

public record ProjectDetailsDto(
    string Id,
    string Titulo,
    string Materia,
    string Ciclo,
    string Estado,
    string LiderId,
    List<string> StackTecnologico,
    string? RepositorioUrl,
    List<CanvasBlock> Canvas,
    List<MemberDto> Members
);

public record MemberDto(string Id, string Nombre, string Email, string? FotoUrl, string Rol);

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

        return new ProjectDetailsDto(
            project.Id,
            project.Titulo,
            project.Materia,
            project.Ciclo,
            project.Estado,
            project.LiderId,
            project.StackTecnologico,
            project.RepositorioUrl,
            project.CanvasBlocks,
            members
        );
    }
}
