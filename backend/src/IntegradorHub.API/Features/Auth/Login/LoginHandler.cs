using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Enums;
using IntegradorHub.API.Shared.Domain.Interfaces;
using IntegradorHub.API.Shared.Domain.ValueObjects;

namespace IntegradorHub.API.Features.Auth.Login;

// === COMMAND ===
public record LoginCommand(
    string FirebaseUid,
    string Email,
    string DisplayName,
    string? PhotoUrl
) : IRequest<LoginResponse>;

public record LoginResponse(
    string UserId,
    string Email,
    string Nombre,
    string Rol,
    bool IsFirstLogin,
    string? GrupoId,
    string? Matricula
);

// === HANDLER ===
public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;

    public LoginHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Buscar usuario existente
            var existingUser = await _userRepository.GetByIdAsync(request.FirebaseUid);
            
            if (existingUser != null)
            {
                // --- ROLE CORRECTION LOGIC ---
                // 1. Force SuperAdmin for personal account (Specific Exception)
                if (existingUser.Email.Equals("uzielisaac28@gmail.com", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser.Rol != "SuperAdmin")
                    {
                        existingUser.Rol = "SuperAdmin";
                        await _userRepository.UpdateAsync(existingUser);
                        Console.WriteLine($"[FIX] Set SuperAdmin role for {existingUser.Email}");
                    }
                }
                // 2. Specific Exception for YOUR Teacher Account
                else if (existingUser.Email.Equals("Uziel.Pech@utmetropolitana.edu.mx", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser.Rol != "Docente")
                    {
                        existingUser.Rol = "Docente";
                        await _userRepository.UpdateAsync(existingUser);
                        Console.WriteLine($"[FIX-URGENT] Forced Docente role for {existingUser.Email}");
                    }
                }
                // 3. GENERAL FIX: Auto-correct any OTHER Docente
                else
                {
                    var reEvaluatedEmail = Email.From(existingUser.Email);
                    if (reEvaluatedEmail.DetectedRole == UserRole.Docente && existingUser.Rol != "Docente")
                    {
                        existingUser.Rol = "Docente";
                        await _userRepository.UpdateAsync(existingUser);
                        Console.WriteLine($"[AUTO-FIX] Corrected {existingUser.Email} to Docente role.");
                    }
                }
                // --- SYNC PROFILE DATA ---
                // Si el usuario tiene nombre genérico "Usuario" o queremos mantener actualizados sus datos de Google
                if (!string.IsNullOrEmpty(request.DisplayName) && request.DisplayName != existingUser.Nombre)
                {
                    existingUser.Nombre = request.DisplayName;
                    await _userRepository.UpdateAsync(existingUser);
                }
                
                if (!string.IsNullOrEmpty(request.PhotoUrl) && request.PhotoUrl != existingUser.FotoUrl)
                {
                    existingUser.FotoUrl = request.PhotoUrl;
                    await _userRepository.UpdateAsync(existingUser);
                }
                // -----------------------------

                // -----------------------------

                // Usuario ya registrado, devolver datos
                return new LoginResponse(
                    existingUser.Id,
                    existingUser.Email,
                    existingUser.Nombre,
                    existingUser.Rol,
                    existingUser.IsFirstLogin,
                    existingUser.GrupoId,
                    existingUser.Matricula
                );
            }

            // 2. Usuario nuevo - detectar rol automáticamente
            Email email;
            try
            {
                email = Email.From(request.Email);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing email {request.Email}: {ex.Message}");
                // Fallback: crear email como Invitado si falla la detección
                email = Email.From("guest@external.com"); // Esto siempre retorna Invitado
            }
            
            var newUser = new User
            {
                Id = request.FirebaseUid,
                Email = request.Email, // Usar el email original, no el parseado
                Nombre = request.DisplayName ?? "Usuario",
                FotoUrl = request.PhotoUrl,
                Rol = email.DetectedRole.ToString(),
                Matricula = email.ExtractedMatricula,
                IsFirstLogin = true // Necesita seleccionar grupo
            };

            await _userRepository.CreateAsync(newUser);
            Console.WriteLine($"[DEBUG] LoginHandler: CREATED NEW USER {newUser.Email} with Role {newUser.Rol}");

            return new LoginResponse(
                newUser.Id,
                newUser.Email,
                newUser.Nombre,
                newUser.Rol,
                newUser.IsFirstLogin,
                newUser.GrupoId,
                newUser.Matricula
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FATAL ERROR in LoginHandler: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw; // Re-throw para que el controller lo maneje
        }
    }
}
