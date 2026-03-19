using MediatR;
using IntegradorHub.API.Shared.Domain.Entities;
using IntegradorHub.API.Shared.Domain.Interfaces;
using Google.Cloud.Firestore;

namespace IntegradorHub.API.Features.Auth.Register;

// === COMMAND ===
public record RegisterCommand(
    string FirebaseUid,
    string Email,
    string Nombre,
    string? ApellidoPaterno,
    string? ApellidoMaterno,
    string Rol,
    string? GrupoId,
    string? Matricula,
    string? CarreraId,
    string? Profesion,
    string? Organizacion,
    List<AsignacionDocente>? Asignaciones
) : IRequest<RegisterResponse>;

public record RegisterResponse(
    bool Success,
    string Message,
    string? UserId
);

// === HANDLER ===
public class RegisterHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUserRepository _userRepository;

    public RegisterHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Verificar si el usuario ya existe por UID (Casos de actualización o recuperación de sesión)
        Console.WriteLine($"[DEBUG] RegisterHandler: Verificando existencia de {request.Email} (UID: {request.FirebaseUid})");
        var existingUserById = await _userRepository.GetByIdAsync(request.FirebaseUid);
        
        // 2. Verificar si el correo ya está en uso por otro UID
        var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);

        if (existingUserByEmail != null && existingUserByEmail.Id != request.FirebaseUid && !existingUserByEmail.IsFirstLogin)
        {
            Console.WriteLine($"[ERROR] RegisterHandler: Intento de registro con correo ya existente: {request.Email}");
            return new RegisterResponse(false, "Este correo ya está registrado en el sistema. Por favor, inicia sesión.", null);
        }

        if (existingUserById != null)
        {
            // RACE CONDITION FIX:
            // Si el usuario ya existe, asumimos que fue creado parcialmente por el frontend (useAuth)
            // o es una corrección de datos. Actualizamos la información en lugar de rechazar.
            Console.WriteLine($"[DEBUG] RegisterHandler: Usuario ya existe (posible race condition). Actualizando datos...");

            existingUserById.Nombre = request.Nombre;
            existingUserById.ApellidoPaterno = request.ApellidoPaterno ?? string.Empty;
            existingUserById.ApellidoMaterno = request.ApellidoMaterno ?? string.Empty;
            existingUserById.Rol = request.Rol;

            // Actualizar campos específicos
            existingUserById.GrupoId = request.GrupoId;
            existingUserById.Matricula = request.Matricula;
            existingUserById.CarreraId = request.CarreraId;
            existingUserById.Profesion = request.Profesion;
            existingUserById.Organizacion = request.Organizacion;
            existingUserById.Asignaciones = request.Asignaciones;
            
            existingUserById.UpdatedAt = DateTime.UtcNow.ToString("o");
            existingUserById.IsFirstLogin = false; // Completó el registro

            await _userRepository.UpdateAsync(existingUserById);
            Console.WriteLine($"[DEBUG] RegisterHandler: Usuario {existingUserById.Email} actualizado correctamente.");

            return new RegisterResponse(true, "Usuario actualizado correctamente", existingUserById.Id);
        }

        // 2. Crear nuevo usuario (si no existía)
        var user = new User
        {
            Id = request.FirebaseUid,
            Email = request.Email,
            Nombre = request.Nombre,
            ApellidoPaterno = request.ApellidoPaterno ?? string.Empty,
            ApellidoMaterno = request.ApellidoMaterno ?? string.Empty,
            Rol = request.Rol,
            
            // Campos comunes y específicos
            GrupoId = request.GrupoId,
            Matricula = request.Matricula,
            CarreraId = request.CarreraId,
            Profesion = request.Profesion,
            Organizacion = request.Organizacion,
            
            // Asignaciones de docente
            Asignaciones = request.Asignaciones,
            
            CreatedAt = DateTime.UtcNow.ToString("o"),
            UpdatedAt = DateTime.UtcNow.ToString("o"),
            IsFirstLogin = false // Ya completó el registro
        };

        await _userRepository.CreateAsync(user);
        Console.WriteLine($"[DEBUG] RegisterHandler: Usuario {user.Email} creado exitosamente con rol {user.Rol}");

        return new RegisterResponse(true, "Usuario registrado correctamente", user.Id);
    }
}
