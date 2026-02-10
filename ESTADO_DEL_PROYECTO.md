# Estado del Proyecto IntegradorHub 🚀

**Última Actualización**: [Fecha Actual]
**Documentos de Referencia**:
- [Plan Maestro (Visión)](.gemini/antigravity/brain/5384e88a-f797-43e7-a9b1-6f013878d5b0/plan_maestro.md)
- [Inventario Técnico (Código)](.gemini/antigravity/brain/5384e88a-f797-43e7-a9b1-6f013878d5b0/inventario_tecnico.md)

---

## ✅ 1. Lo Que Ya Tenemos (Implementado)

### 🔐 Autenticación y Usuarios ("Smart Auth")
- [x] **Login Unificado**: Una sola pantalla para Login y Registro.
- [x] **Detección de Roles**: Automática por dominio de correo (@alumno, @utmetropolitana).
- [x] **Auto-Capitalización**: Nombres se guardan como "Juan Pérez" automáticamente.
- [x] **Anti-Duplicados**: El backend actualiza usuarios existentes en lugar de rechazar el registro (Solución Race Condition).

### 🛡️ Panel de Administración
- [x] Acceso restringido a Admins.
- [x] Tablas de Alumnos y Docentes funcionales.
- [x] Catálogos de Carreras y Grupos (Básicos).

### 🗄️ Backend (.NET 8)
- [x] Estructura Clean Architecture (Vertical Slices).
- [x] Conexión estable a Firestore.

---

## 🚧 2. Lo Que Falta (La Brecha / Gap Analysis)

### 👥 Fase 3: Lógica de Equipos (PRIORIDAD ALTA)
El sistema actual permite crear proyectos, pero **no valida** quién puede unirse.
- [ ] **Backend - Filtros de Integridad**:
    - [ ] Endpoint `GET /students/available`: Que retorne SOLO alumnos del *mismo grupo* del líder.
    - [ ] Endpoint `GET /teachers/available`: Que retorne SOLO docentes asignados a ese grupo.
- [ ] **Frontend - Modal de Creación**:
    - [ ] Selector de Docente que consuma el filtro anterior.
    - [ ] Buscador de compañeros que consuma el filtro anterior.
    - [ ] *Tooltip* de matrícula para no confundir a los "Juan Pérez".

### 📊 Fase 3.5: Evaluaciones
- [ ] **Frontend**: No existen pantallas para que los docentes califiquen.
- [ ] **Backend**: Existe lógica básica, pero falta conectar con el flujo de "Docente asignado".

### 🎨 Fase 4: UX/UI (Futuro)
- [ ] Diseño final estilo "Notion/Teams".
- [ ] Perfiles públicos editables.

---

## 💡 3. Reglas de Negocio Confirmadas (Backend)

### Gestión de Equipos
1.  **Exclusividad**: Un alumno **SOLO** puede estar en 1 equipo. (Debe "renunciar" para unirse a otro).
2.  **Límite de Integrantes**: Estrictamente **Máximo 5 personas**.
3.  **Sucesión**: Si el líder se sale, el liderazgo pasa al **siguiente miembro** en la lista (orden de llegada).
4.  **Evaluación Docente**: Solo evalúan docentes que impartan materias de "Alta Prioridad" (Integradora) al grupo del equipo.

### 🛠️ Sugerencias Técnicas
- **Validación de Grupo**: Sugiero que el backend rechace cualquier intento de agregar un `studentId` que no pertenezca al `groupId` del proyecto, por seguridad (no solo confiar en el frontend).
- **Notificaciones**: Sería ideal agregar un pequeño sistema de notificaciones (o emails) cuando seas agregado a un equipo.
