# IntegradorHub - Source of Truth

Este documento sirve como el ancla principal de contexto para cualquier agente (Claude, Gemini, etc.) que trabaje en el proyecto **IntegradorHub**.

## 1. Arquitectura General y Tecnologías

El proyecto utiliza un enfoque de **Vertical Slice Architecture** en el backend (.NET 8) y un esquema orientado a 'Features' en el frontend (React 19 + Vite).

*   **Backend**: `.NET 8`, patrón CQRS con MediatR. La organización del código está en `Features/` agrupado por caso de uso en lugar de capas transversales.
*   **Frontend**: `React 19` con Vite, Tailwind CSS. La lógica se encuentra igualmente en `/src/features/` para espejar el backend. Componentes reusables "tontos" en `/src/components/`.
*   **Base de datos**: `Google Firestore` (NoSQL). Autenticación vía `Firebase Auth`.

## 2. Reglas de Negocio Clave (La "Triada Académica")

Todo el desarrollo debe tener en mente la dinámica central: **Alumno - Docente - Invitado**.

### Restricción de Contexto (Micro-segmentación)
1. **El "Filtro de Grupo"**: Todo proyecto se crea dentro del contexto del "Grupo" del creador (ej: 5B, 5C).
2. Los alumnos **solo** pueden buscar perfiles de su propio grupo al invitar miembros al *Squad*.
3. Los docentes **solo** pueden evaluar proyectos que pertenezcan a los grupos a los que han sido asignados.
4. **Validación de Identidad / Auth Gatekeeper**: El rol del usuario no se asigna al azar; se deduce automáticamente haciendo un parseo de Expresiones Regulares (Regex) en el correo institucional (`@utmetropolitana.edu.mx`).

## 3. Jerarquía de Carpetas de Contexto

El conocimiento de este proyecto se modulariza en los siguientes directorios para evitar saturación:

*   **`.claude/.Rules/`**: Contiene las reglas detalladas y principios del proyecto (ej. `general.md`).
*   **`.gemini/modulos/`**: Documentación detallada de cada módulo independiente, incluyendo el Roadmap y características granulares (ej: Auth, UI/UX).

## 4. Estándares de Código y Diseño

*   **Modo Monocromático**: UI limpia, minimalista y profesional, enfocada fuertemente en usabilidad y escalabilidad (inspiración: Notion, Vercel, Stripe).
*   **Seguridad**: NUNCA se suben credenciales (`firebase-admin.json`, `.env`). Validar todas las consultas `Firebase` con las `Security Rules`.
*   **Flujos Protegidos**: Verificar el Token (JWT) en peticiones a APIs de backend y validación estricta de Roles (Super Admin vs. Estudiante vs. Evaluador).

---
*Nota: Si necesitas entender la implementación de una función o el estado actual, utiliza el comando `npx repomix` para generar en `/repomix-output.txt` un volcado de código estructurado.*
