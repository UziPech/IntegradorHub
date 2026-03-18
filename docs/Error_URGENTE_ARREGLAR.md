# ERROR: URGENTE ARREGLAR - Falla en Eliminación de Proyectos

## Estado Actual
- El botón de eliminar proyecto no está funcionando a pesar de las actualizaciones de roles y la implementación del borrado en cascada.
- No se muestran errores explícitos (Silent Failure o Error sin reporte claro).

## Hipótesis
1. **Desajuste de Tipos (Object vs Int):** En conversaciones previas se mencionó que los puntos de evaluación cambiaron de ser un entero (`int`) a un objeto (`object` o estructura compleja). Si el `EvaluationRepository` intenta mapear este campo incorrectamente durante la lectura (`GetByProjectIdAsync`), podría estar fallando silenciosamente o lanzando una excepción de deserialización.
2. **Dependencias en Cascada:** La lógica de borrado manual en `DeleteProjectHandler.cs` podría estar fallando si alguna evaluación tiene inconsistencias en sus IDs o si el repositorio de Firestore tiene problemas al borrar documentos con la nueva estructura.
3. **Puntuación en Firebase:** Si hay documentos antiguos en la colección de `Evaluations` que aún tienen el formato `int`, pero el código ahora espera una estructura de puntos, esto causaría un error al listar las evaluaciones para borrarlas.

## Datos de Interés
- **Endpoint:** `/api/projects/{projectId}`
- **Handler:** `DeleteProjectHandler.cs`
- **Repositorio Crítico:** `EvaluationRepository.cs`
- **Punto de Sospecha:** Cambio en el sistema de puntos/evaluaciones y su nuevo sistema de puntos.

---
_Documento generado para seguimiento técnico_
