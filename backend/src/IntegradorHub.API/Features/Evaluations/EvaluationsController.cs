using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IntegradorHub.API.Features.Evaluations.Create;
using IntegradorHub.API.Features.Evaluations.GetByProject;
using IntegradorHub.API.Features.Evaluations.Visibility;
using IntegradorHub.API.Shared.Abstractions;

namespace IntegradorHub.API.Features.Evaluations;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EvaluationsController : BaseApiController
{
    private readonly IMediator _mediator;

    public EvaluationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Crea una nueva evaluación para un proyecto.
    /// El DocenteId se extrae del JWT para prevenir spoofing.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateEvaluationResponse>> Create([FromBody] CreateEvaluationRequest request)
    {
        var command = new CreateEvaluationCommand(
            request.ProjectId,
            GetUserId(), // Previene ID Spoofing: DocenteId viene del JWT
            request.DocenteNombre,
            request.Tipo,
            request.Contenido,
            request.Calificacion
        );

        try
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (ArgumentException ex) { return BadRequest(ex.Message); }
    }

    /// <summary>
    /// Obtiene todas las evaluaciones de un proyecto.
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<EvaluationDto>>> GetByProject(string projectId)
    {
        var query = new GetEvaluationsByProjectQuery(projectId);
        var evaluations = await _mediator.Send(query);
        return Ok(evaluations);
    }
    /// <summary>
    /// Cambia la visibilidad de una evaluación (Público/Privado).
    /// El UserId se extrae del JWT para prevenir spoofing.
    /// </summary>
    [HttpPatch("{id}/visibility")]
    public async Task<ActionResult<UpdateEvaluationVisibilityResponse>> ChangeVisibility(string id, [FromBody] ChangeVisibilityRequest request)
    {
        var command = new UpdateEvaluationVisibilityCommand(id, GetUserId(), request.EsPublico);
        try
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }
}

// DTOs limpios: sin campos UserId/DocenteId que el backend extrae del JWT
public record ChangeVisibilityRequest(bool EsPublico);

public record CreateEvaluationRequest(
    string ProjectId,
    string DocenteNombre,
    string Tipo,
    string Contenido,
    int? Calificacion
);
