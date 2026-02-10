using Google.Cloud.Firestore;
using IntegradorHub.API.Shared.Domain.Enums;

namespace IntegradorHub.API.Shared.Domain.Entities;

[FirestoreData]
public class Project
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;
    
    [FirestoreProperty("titulo")]
    public string Titulo { get; set; } = string.Empty;
    
    [FirestoreProperty("materia")]
    public string Materia { get; set; } = string.Empty;
    
    [FirestoreProperty("materia_id")]
    public string MateriaId { get; set; } = string.Empty;
    
    [FirestoreProperty("ciclo")]
    public string Ciclo { get; set; } = string.Empty;
    
    [FirestoreProperty("grupo_id")]
    public string GrupoId { get; set; } = string.Empty;
    
    [FirestoreProperty("lider_id")]
    public string LiderId { get; set; } = string.Empty;
    
    [FirestoreProperty("miembros_ids")]
    public List<string> MiembrosIds { get; set; } = new();
    
    [FirestoreProperty("docente_id")]
    public string? DocenteId { get; set; }
    
    [FirestoreProperty("estado")]
    public string Estado { get; set; } = nameof(ProjectState.Borrador);
    
    [FirestoreProperty("stack_tecnologico")]
    public List<string> StackTecnologico { get; set; } = new();
    
    [FirestoreProperty("repositorio_url")]
    public string? RepositorioUrl { get; set; }
    
    [FirestoreProperty("demo_url")]
    public string? DemoUrl { get; set; }
    
    [FirestoreProperty("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }
    
    [FirestoreProperty("canvas_blocks")]
    public List<CanvasBlock> CanvasBlocks { get; set; } = new();
    
    [FirestoreProperty("created_at")]
    public Timestamp CreatedAt { get; set; }
    
    [FirestoreProperty("updated_at")]
    public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
public class CanvasBlock
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [FirestoreProperty("type")]
    public string Type { get; set; } = "text"; // text, heading, image, video, code
    
    [FirestoreProperty("content")]
    public string Content { get; set; } = string.Empty;
    
    [FirestoreProperty("order")]
    public int Order { get; set; }
    
    [FirestoreProperty("metadata")]
    public Dictionary<string, string>? Metadata { get; set; }
}
