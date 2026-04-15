using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IntegradorHub.API.Shared.Abstractions;

/// <summary>
/// Controlador base que centraliza la extracción del UserId
/// desde el JWT de Firebase Auth. Todos los controladores protegidos
/// deben heredar de esta clase para evitar duplicación de lógica.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Extrae el UID del usuario autenticado desde el token JWT de Firebase.
    /// Firebase usa el claim "user_id" como principal, pero también lo mapea
    /// al ClaimTypes.NameIdentifier estándar de .NET.
    /// </summary>
    /// <returns>El Firebase UID del usuario autenticado.</returns>
    /// <exception cref="UnauthorizedAccessException">Si no se encuentra el claim de identidad.</exception>
    protected string GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value
        ?? throw new UnauthorizedAccessException("Usuario no autenticado: No se encontró el claim de identidad en el token JWT.");

    /// <summary>
    /// Intenta obtener el email del usuario desde el JWT.
    /// Útil para auditoría y logging.
    /// </summary>
    protected string? GetUserEmail() =>
        User.FindFirst(ClaimTypes.Email)?.Value
        ?? User.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
}
