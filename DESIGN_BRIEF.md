# Handoff para Agente de Diseño (Agente B)

**Proyecto:** IntegradorHub
**Estado Actual:** Funcionalidad completada "Backend-to-Frontend". Datos reales conectados.
**Objetivo Próximo:** Mejorar drásticamente la UX/UI para un look "Social & Premium".

## 1. Resumen Técnico
*   **Frontend:** React, Vite, TailwindCSS, Framer Motion, Lucide React.
*   **Backend:** .NET 8 API (Corriendo en puerto local).
*   **Base de Datos:** SQL Server (Local).
*   **Rutas Principales:**
    *   `/dashboard`: Feed principal.
    *   `/projects`: Grid de proyectos.
    *   `/team`: Lista de estudiantes.
    *   `/calendar`: Vista de agenda (Mockup).

## 2. Funcionalidad Actual (Lo que YA funciona)
No rompas esta lógica al rediseñar:
*   **Sidebar**: Navegación funcional con `NavLink`.
*   **Dashboard**:
    *   `fetchProjects()`: Trae proyectos reales del grupo.
    *   `fetchSuggestions()`: Trae alumnos reales del grupo para "Sugeridos".
    *   `Actividad Reciente`: Se deriva de la lista de proyectos (nombres reales).
*   **Proyectos**:
    *   Creación de proyectos (Modal funcional).
    *   Detalles de proyecto (Modal con gestión de miembros).
*   **Auth**: Login/Registro con detección de rol (Docente/Alumno) vía correo institucional.

## 3. Áreas que Necesitan Diseño ("Wow Factor")
El usuario siente que la app se ve "hardcoded" o genérica. Necesitamos:
*   **Tipografía y Espaciado**: Usar fuentes más modernas (Inter/Outfit ya están o se pueden agregar), mejor ritmo vertical.
*   **Tarjetas de Proyecto**: Actualmente son funcionales pero básicas. Hacerlas parecer "posts" de una red social profesional o tarjetas de portafolio premium.
*   **Sidebar**: Hacerlo más elegante (quizás glassmorphism o mejores estados de hover/active).
*   **Dashboard Feed**: La sección "Actividad Reciente" y "Sugerencias" necesita verse integrada, no como widgets aislados.
*   **CalendarPage**: Es un mockup funcional pero visualmente simple. Puede ser una oportunidad para mostrar un diseño de calendario UI avanzado.

## 4. Archivos Clave para Editar
*   `src/index.css`: Variables globales, fuentes, utilidades base.
*   `src/features/dashboard/components/DashboardLayout.jsx`: Estructura general.
*   `src/features/dashboard/components/Sidebar.jsx`: Navegación.
*   `src/features/dashboard/pages/DashboardPage.jsx`: Home principal.
*   `src/features/projects/components/ProjectCard.jsx`: Componente repetido en varias vistas.
*   `src/features/dashboard/pages/TeamPage.jsx`: Lista de usuarios (Grid de tarjetas).

## 5. Instrucciones Específicas
*   **NO** cambies la lógica de `fetch`, `useEffect` o los nombres de las props (ej: `project.titulo`, `student.nombreCompleto`).
*   **SÍ** puedes cambiar todas las clases de Tailwind, agregar animaciones con `framer-motion`, y reestructurar el HTML dentro de los componentes para lograr el diseño deseado.
*   **SÍ** puedes instalar nuevas librerías de UI si son ligeras y aportan valor (ej: componentes de Shadcn/UI si decides implementarlos manualmente, o librerías de animación).

¡Buena suerte, Agente B! Haz que esto brille. ✨

## 6. Lógica Crítica y Snippets (Contexto Técnico)
Para que entiendas cómo fluyen los datos sin romper nada.

### A. Autenticación y Datos de Usuario (`useAuth.jsx`)
El hook `useAuth` provee el objeto `userData` que es vital para toda la app.
**No rompas:** El acceso a `userData.rol` o `userData.grupoId`.

```javascript
// Frontend: src/features/auth/hooks/useAuth.jsx
// Así obtenemos si es 'Alumno' o 'Docente' y su grupo
const { userData } = useAuth();

if (userData?.rol === 'Alumno') { ... }
if (userData?.grupoId) { ... }
```

### B. Proyectos del Grupo (`ProjectsController` -> `DashboardPage`)
El Dashboard carga proyectos filtrados por el `grupoId` del usuario.

**Backend (C#):**
```csharp
// ProjectsController.cs
[HttpGet("group/{groupId}")]
public async Task<ActionResult<List<ProjectDto>>> GetByGroup(string groupId)
{
    // Retorna solo proyectos de ese grupo escolar
    return Ok(await _mediator.Send(new GetProjectsByGroupQuery(groupId)));
}
```

**Frontend (React):**
```javascript
// DashboardPage.jsx
useEffect(() => {
    if (userData?.grupoId) {
        // Llama al endpoint con el ID del grupo del usuario logueado
        api.get(`/api/projects/group/${userData.grupoId}`)
           .then(res => setProjects(res.data));
    }
}, [userData]);
```

### C. Sugerencias de Equipo (`TeamsController` -> `TeamPage`)
Busca alumnos del *mismo grupo* que *no tienen equipo*.

**Backend (C#):**
```csharp
// TeamsController.cs
[HttpGet("available-students")]
public async Task<ActionResult<List<StudentDto>>> GetAvailableStudents([FromQuery] string groupId)
{
    // SQL: SELECT * FROM Users WHERE Role='Alumno' AND GroupId=@groupId AND HasTeam=0
    return Ok(await _mediator.Send(new GetAvailableStudentsQuery(groupId)));
}
```

**Frontend (React):**
```javascript
// TeamPage.jsx
const fetchStudents = async () => {
    // Importante pasar el groupId actual
    const response = await api.get(`/api/teams/available-students?groupId=${userData.grupoId}`);
    setStudents(response.data);
};
```
