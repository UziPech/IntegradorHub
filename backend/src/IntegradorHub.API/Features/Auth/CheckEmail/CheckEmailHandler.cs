using MediatR;
using IntegradorHub.API.Shared.Domain.Interfaces;

namespace IntegradorHub.API.Features.Auth.CheckEmail;

// === COMMAND ===
public record CheckEmailCommand(string Email) : IRequest<CheckEmailResponse>;

public record CheckEmailResponse(
    bool Exists,
    bool IsFullyRegistered,
    string? Message
);

// === HANDLER ===
public class CheckEmailHandler : IRequestHandler<CheckEmailCommand, CheckEmailResponse>
{
    private readonly IUserRepository _userRepository;

    public CheckEmailHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<CheckEmailResponse> Handle(CheckEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return new CheckEmailResponse(false, false, "Correo no encontrado");
        }

        return new CheckEmailResponse(
            true, 
            !user.IsFirstLogin, 
            user.IsFirstLogin ? "Registro incompleto" : "Usuario ya completamente registrado"
        );
    }
}
