Kiosko Integrador Hub: Transformación del Talento en DSM
Documento de Análisis de Requerimientos y Estrategia Académica
1. Planteamiento de la Problemática: El "Cementerio de Código"
En la carrera de Desarrollo de Software Multiplataforma (DSM), el Proyecto Integrador es el activo intelectual más valioso del alumno. Sin embargo, enfrentamos tres barreras críticas:
Fugacidad del Capital Intelectual: Una vez calificado, el software queda archivado en repositorios privados o discos duros. El conocimiento generado (errores resueltos, arquitecturas probadas) no sirve de base para futuras generaciones.
Invisibilidad Técnica: Los sistemas actuales (Teams/Moodle) son gestores de tareas, no vitrinas de talento. Un reclutador o un docente de otra área no tiene forma de visualizar el "stack" tecnológico o el "pitch" de un proyecto de forma inmediata.
Ruido en la Identidad y el Feedback: La falta de un registro centralizado que reconozca automáticamente quién es alumno y quién es docente mediante el correo institucional genera confusión en la asignación de responsabilidades y en la validez del feedback técnico.
2. Justificación: Del "Entregable" al "Activo Profesional"
Este sistema no es una simple base de datos; es una estrategia para revalorizar el trabajo del estudiante:
Impacto Académico: El error de hoy se convierte en el caso de estudio de mañana. Al documentar las "Lecciones Aprendidas", elevamos el nivel técnico de toda la carrera.
Impacto Profesional: Cada miembro del Squad obtiene una URL profesional verificable que demuestra su rol real (Backend, Frontend, UI/UX) y las validaciones de sus docentes.


3. Definición de Actores y Roles (El Modelo 3+1)
Para esta fase de DSM, hemos centralizado la autoridad en tres niveles operativos y un nivel de control maestro:
3.1. Miembro del Squad (Alumno)
Identidad: Reconocido por el prefijo numérico en su correo (Matrícula).
Responsabilidad: Generador de contenido. Opera como Líder (con permisos de creación y gestión de equipo) o Colaborador.
-Colaborador(no puede eliminar el proyecto )
Restricción de Contexto: Su capacidad de acción está limitada a su Grupo (ej. 5B). No puede agregar miembros de otros grupos para mantener la integridad de la evaluación de integradora.
3.2. Evaluador Contextual (Docente)
Identidad: Reconocido por el prefijo alfabético en su correo institucional.
Responsabilidad: Garante de calidad técnica. Su autoridad es relativa: solo puede evaluar proyectos que pertenezcan a los grupos que tiene asignados en el cuatrimestre.
Feedback: Capacidad de emitir retroalimentación técnica que el equipo puede elegir hacer pública como "Insignia de Logro".
3.3. Invitado (Empresa / Externo)
Identidad: Correos genéricos (Gmail, Outlook) o de organizaciones externas.
Responsabilidad: Consumidor de valor. Utiliza el Kiosko para reclutamiento, visualizando el Elevator Pitch y el One-Pager de los proyectos públicos.
3.4. Super Admin (Uziel Isaac, Yael Lopez)
Control Maestro: Único actor capaz de dar de alta materias, asignar prioridades a docentes y realizar el "Hard-Delete" en caso de registros erróneos. Gestiona el ciclo de vida (apertura y cierre de cuatrimestres).


4. Lógica de Interacción y Complejidad (Módulos)
4.1. Módulo de Registro Adaptativo
Al ingresar el correo, el sistema procesa el dominio. Si es @utmetropolitana.edu.mx, dispara un algoritmo de segmentación:
Si es Alumno: Bloquea el formulario a la carrera de DSM y solicita Matrícula y Grupo.
Si es Docente: Solicita especialidad y despliega la lista de grupos de DSM para su auto-asignación.
4.2. Creación de Squads y Filtros de Seguridad
Aquí resolvemos la complejidad de los datos:
Handshake de Grupo: Cuando el Líder crea el proyecto, el sistema inyecta su ID_Grupo.
Filtro de Integrantes: El buscador de compañeros solo devuelve usuarios que compartan el mismo ID_Grupo.
Validación por Tooltip: Para evitar errores de homónimos, al pasar el cursor (hover) sobre el nombre de un alumno en la lista de búsqueda, se muestra su Matrícula y foto si es que contiene uno en un texto flotante. Esto asegura que el Líder agregue a la persona correcta.
Vinculación Docente: El sistema filtra automáticamente a los maestros que declararon impartir clase en ese grupo específico.
4.3. El Project Canvas (Edición Estilo Notion)
El proyecto se visualiza como una tarjeta dinámica en un Dashboard tipo Microsoft Teams.
Modo Edición: Un sistema de bloques para cargar la descripción, arquitectura, stack tecnológico (tags) y el Pitch de Video.
Toggle de Visibilidad: El proyecto nace en estado "Privado". Solo cuando el equipo decide que está listo, se activa el estado "Público" para que sea visible en el Showcase de invitados.


5. Requerimientos Técnicos Prioritarios (DSM)
RF-01: Reconocimiento de rol por Regex de correo institucional.
RF-02: Filtrado de equipo restringido por el Grupo del Líder.
RF-03: Tooltip de validación de matrícula en el buscador de miembros.
RF-04: CRUD de materias y prioridades gestionado por el Super Admin.
RF-05: Galería pública filtrable por Stack Tecnológico para invitados.


Kiosko Integrador Hub (DSM): Roadmap de Desarrollo y Arquitectura
Este documento consolida la narrativa estratégica con la complejidad técnica necesaria para la implementación inmediata en el cuatrimestre Enero-Abril 2026.
1. El Core de la Aplicación: La "Triada Académica"
Para resolver la vaguedad de los puntos anteriores, el sistema se construye sobre una relación de dependencia estricta:Usuario $\rightarrow$ Grupo $\rightarrow$ Proyecto $\rightarrow$ Docente.
1.1. Lógica de Negocio: El "Filtro de Contexto"
Aislamiento de Squads: El sistema debe inyectar el grupo_id en cada consulta. No existe la búsqueda global de alumnos; solo existe la búsqueda dentro del "Contenedor de Grupo".
Integridad de Matrícula: La matrícula no es un dato estético. Es el Unique Key que previene que un alumno se registre dos veces o en grupos distintos.
2. Arquitectura de la Interfaz (UI/UX)
Siguiendo la estética de Microsoft Teams (Navegación) y Notion (Contenido).
2.1. Componentes Base (Átomos)
Sidebar Institucional: Navegación fija con módulos: Proyectos Públicos, Mi Squad, Perfil Profesional y Admin Panel (Solo para ti).
Project Card (DSM-Spec): Debe mostrar: Título, Stack Tecnológico (Badges), Integrantes (Avatares) y un indicador de "Estado" (Borrador/Público).
The Hover-Tooltip: Componente reactivo que al detectar onMouseOver en un nombre, hace un fetch ligero o muestra el atributo matrícula, y foto de perfil (Storage) guardado en el estado local.

2.2. El Editor de Proyectos (The Canvas)
No usaremos un formulario largo. Usaremos un Layout de Bloques:
Bloque de Encabezado: Título y Banner.
Bloque de Squad: Gestión de miembros (Agregar/Eliminar).
Bloque de Documentación: Editor de texto enriquecido para la arquitectura y problemática.
Bloque de Multimedia: Inputs específicos para URL de YouTube (Pitch) y Dropzone para capturas de pantalla.
3. Especificación de Roles SCRUM (Rubrica Profesora)
Para cumplir con el instrumento de evaluación, el sistema debe reflejar estos roles en el equipo de desarrollo:
Product Owner (Uziel Isaac): Gestión de requerimientos y validación de historias de usuario. (Acceso Admin).
Scrum Master: Encargado de que el flujo de estados (Borrador -> Público) se cumpla.
Dev Team: El resto del Squad que tiene permisos de edición sobre el Canvas.
4. Mapa de Navegación (User Journey)
Paso 1: Autenticación e Identificación
Usuario ingresa con Google(esto puede afectar a tu rol).
El sistema ejecuta la Regex de Correo.
Resultado: Redirección automática al Dashboard correspondiente (Alumno/Docente/Invitado).
Paso 2: Configuración de Contexto (Solo Alumnos)
Si es su primera vez, el sistema obliga a seleccionar Grupo y confirmar Matrícula. Estos campos se vuelven "Read-Only" después para evitar fraude académico.

Paso 3: Orquestación del Proyecto
El Líder crea el proyecto.
Invita a miembros (Filtrados por su grupo).
Selecciona al Docente de Integrante (Filtrado por maestros asignados a ese grupo).
Paso 4: Publicación y Showcase
El equipo completa el 100% de los bloques obligatorios.
Se activa el botón "Publicar".
El proyecto aparece en la Galería de Invitados para ser visto por reclutadores.



Especificación Técnica de Ingeniería: Kiosko Integrador (MVP DSM)
Enfoque: Micro-segmentación para la carrera de Desarrollo de Software Multiplataforma.
Arquitectura de Datos: Relacional con persistencia en Firestore.

1. El Motor de Identidad (Auth Gatekeeper)
La entrada al sistema no es un simple login; es un enrutador de contexto. El sistema debe procesar el string del correo electrónico antes de permitir el acceso al dashboard.

1.1. Algoritmo de Enrutamiento de Dominio
Trigger de Entrada: Al momento de la autenticación (Google Auth/Firebase), se extrae el dominio y el prefijo.
Lógica de Segmentación:

Regex Académico Alumno: ^(\d{8})@utmetropolitana\.edu\.mx$
Complejidad: Si hace match con 8 dígitos al inicio, el sistema dispara automáticamente una consulta al catálogo de "Alumnos" para validar Matrícula. Si no existe, lanza el "Formulario de Primer Registro" bloqueando la carrera a "DSM". debe ser una matricula ya que los correos institucionales son numéricos.

Regex Académico Docente: ^[a-zA-Z.]+@utmetropolitana\.edu\.mx$
Complejidad: Si detecta caracteres alfabéticos, se mapea al rol "Evaluador". Se habilita el módulo de "Asignación de Grupos" donde el docente elige de qué grupos (ej. 5B, 5C) es responsable en el cuatrimestre actual.

Fallback Externo: Cualquier otro dominio se categoriza como "Invitado". Se restringe la escritura en la base de datos (ReadOnly por defecto).

2. Arquitectura de Grupos y Vinculación Docente
Este es el núcleo de la coherencia del sistema. No es un campo de texto, es una relación jerárquica.

2.1. El Filtro de "Ecosistema de Grupo"
Dependencia Funcional: Un Alumno (A) pertenece a un Grupo (G). Un Docente (D) tiene N Grupos.

Lógica de Creación de Proyecto:
Contexto Automático: Cuando el Alumno "Líder" crea un proyecto, el sistema inyecta el ID del Grupo del líder en el documento del proyecto de forma inmutable.
Selección de Docente: El sistema realiza un GET a la colección de Docentes filtrando por grupos_asignados que contengan el ID_Grupo del alumno.
Complejidad: Esto garantiza que Jose (del 5B) solo pueda elegir a Roberto como profesor de integradora si Roberto registró previamente que atiende al 5B. Evitamos datos "huérfanos".


















3. Protocolo de Squads (Data Integrity)
Para evitar que el sistema se llene de "Juan Pérez" duplicados, implementamos una lógica de Descubrimiento de Miembros.

3.1. Búsqueda de Integrantes por Contexto
Query Restringida: El buscador de integrantes (Input) solo realiza peticiones sobre la colección de usuarios cuyo atributo grupo == grupo_del_lider.
-Interacción UX (The Hover Logic):
Visualización Primaria: Nombre y Apellidos (UX-Friendly).
Validación Técnica: Al detectar el evento onMouseEnter (hover) sobre el nombre del compañero, se dispara un Tooltip que recupera el atributo matrícula del objeto.
Objetivo: Eliminar el error humano en homónimos. El líder confirma visualmente que la matrícula 23060925 corresponde al compañero que
tiene a su lado.

4. Gestión de Contenidos: El "Project Canvas"
Abandonamos el formulario estático por un sistema de Bloques de Información.

4.1. Estructura del Canvas (Modo Edición)
El proyecto se comporta como un documento dinámico (Estilo Notion):
Bloque Header: Metadatos automáticos (Grupo, Carrera, Cuatrimestre).
Bloque Squad: Lista de integrantes con roles técnicos (Backend, Frontend, UI/UX).
Bloque Multimedia: * Pitch Video: Enlace embebido con validación de URL (YouTube/Drive).
Gallery: Carrusel de 3-5 capturas del sistema (con Lazy Loading para optimizar performance).
Bloque Técnico: Espacio de texto enriquecido (Markdown) para la descripción de la problemática y la arquitectura.
Nota: una vez que este este publicada de forma publica, (debemos de agregar un apartado de publico y privado, así los proyectos que aun no están terminamos no puedan verse)

5. Gobierno de Datos (Super Admin - Tu Cuenta)
Como Super Admin, actúas como el Oracle de la Base de Datos.

5.1. Control Maestro de Catálogos
Gestión de Docentes: Tienes la capacidad de "Promover" a un docente (Prioridad Alta/Baja). Los docentes de Prioridad Alta tienen sus comentarios destacados con una insignia de "Validado por la Academia".
Gestión de Materias: Tú das de alta las materias de DSM. Esto es crucial porque cuando el alumno crea el proyecto, debe elegir para qué asignatura es (ej. Aplicaciones Web Orientadas a Servicios).
Hard-Delete Académico: Solo tú puedes eliminar proyectos o desvincular alumnos por errores de registro, manteniendo la trazabilidad histórica de quién realizó el cambio.

6. Matriz de Complejidad de UI (Vistas por Rol)
Alumno (Dashboard Colaborativo): Enfocado en la edición y visualización de progreso. Muestra su "Squad" en primer plano.
Docente (Dashboard de Revisión): Lista de proyectos filtrada por sus grupos asignados. Incluye una "Cola de Evaluación" de los proyectos que aún no tienen feedback técnico.
Invitado (Showcase): Galería infinita de proyectos de DSM con un buscador por "Stack Tecnológico" (ej. "React", "Firebase").








Arquitectura de Datos y Flujos de Trabajo (DSM)
Este documento define la estructura técnica de Firestore y la lógica de transición de estados para el Kiosko Integrador.
1. Modelo de Datos (Esquema Firestore)
Siguiendo las reglas de seguridad de la plataforma, toda la información se organiza en la ruta raíz: /artifacts/{appId}/.
1.1. Colección: public/data/users
Almacena el perfil profesional de alumnos, docentes e invitados.
ID del Documento: uid (Firebase Auth)
Campos:
nombre_completo: string
rol: enum ('alumno', 'docente', 'invitado', 'admin')
email: string (único)
matricula: string (solo alumnos)
grupo_id: string (ej. "5B" - solo alumnos)
especialidad: string (ej. "Fullstack Developer")
organizacion: string (solo invitados)
grupos_docente: array [string] (solo docentes, ej. ["5B", "5C"])
prioridad_docente: boolean (Default: false)
1.2. Colección: public/data/projects
Repositorio central de proyectos de DSM.
Campos:
titulo: string
slug: string (URL friendly)
lider_id: string (UID del creador)
miembros: array [uid] (Máximo 5)
grupo_contexto: string (Heredado del líder)
docente_asignado: uid (Docente de integradora)
estado: enum ('borrador', 'privado', 'publico', 'historico')
content_blocks: array [objects] (Estructura tipo Notion: {type: 'text|image|video', content: '...'})
stack_tecnico: array [string] (ej. ["React Native", "Express", "PostgreSQL"])
fecha_creacion: timestamp
1.3. Colección: public/data/evaluations
Documentos de feedback técnico vinculados a proyectos.
Campos:
proyecto_id: id
docente_id: uid
comentario: string (Markdown)
tipo: enum ('oficial', 'sugerencia')
visto_por_equipo: boolean
2. Flujo de Estados del Proyecto (Visibilidad)
Para resolver la necesidad de "proyectos no terminados", implementamos una máquina de estados:
Estado: Borrador (Draft)
Visibilidad: Solo el Líder.
Acción: Creación inicial, el equipo aún no está invitado.
Estado: Privado (Squad Only)
Visibilidad: El Squad (miembros) y el Docente asignado.
Acción: Edición colaborativa, carga de arquitectura y video pitch. El docente puede empezar a dar feedback interno.
Estado: Público (Published)
Visibilidad: Todo el Kiosko (Alumnos, Docentes, Invitados).
Acción: Solo disponible cuando el Docente o el Líder marcan el proyecto como "Listo para Galería". Es indexable por el buscador de invitados.
Estado: Histórico (Archived)
Visibilidad: Público (Solo Lectura).
Acción: Ejecutado por el Admin al fin del cuatrimestre. Nadie (ni el líder) puede editarlo. Queda como legado académico.
3. Lógica de Servicio: Filtros en Memoria
Para cumplir con la eficiencia de Firebase y evitar índices complejos:
Buscador de Compañeros: 1. El sistema descarga la lista de users donde grupo_id == grupo_lider.
2. El filtrado por nombre/matrícula se realiza en el cliente (JS) mediante un buscador reactivo.
Galería de Invitados: 1. Se descarga la colección projects con estado == 'publico'.
2. Los filtros por "Stack Tecnológico" se ejecutan en memoria para garantizar velocidad instantánea.
4. Validaciones de Seguridad (Reglas Críticas)
Escritura: Un usuario solo puede editar el documento en projects si su uid está en el array miembros o es el lider_id.
Evaluación: Solo un usuario con rol == 'docente' y que tenga el grupo_id del proyecto en su array grupos_docente puede escribir en la colección evaluations.


Suplemento de UX Research y Metodología SCRUM
Proyecto: Kiosko Integrador Hub (Enfoque DSM)
1. Definición del Equipo SCRUM (Punto 2.c.a)
Para efectos de la materia y el desarrollo del sistema, la estructura es:
Product Owner: Uziel Isaac Pech Balam (Responsable de la visión del producto y priorización del Backlog).
Scrum Master: Jose Yael Lopez  (Facilitador de ceremonias y eliminador de impedimentos).
Equipo de Desarrollo: * Frontend Dev: Encargado de la UI tipo Notion/Teams y lógica de filtros.
Backend/Firebase Dev: Encargado de las Reglas de Seguridad y Estructura NoSQL.
QA/UX Tester: Encargado de validar los flujos de registro por Regex.







2. Historias de Usuario (User Stories)
ID
Historia de Usuario
Criterio de Aceptación
HU-01
Como Alumno, quiero que el sistema me reconozca por mi correo, para no tener que configurar mi rol manualmente.
El sistema debe identificar el dominio @utmetropolitana.edu.mx y el prefijo de matrícula.
HU-02
Como Líder de Equipo, quiero filtrar a mis compañeros por grupo, para evitar agregar personas de otras secciones por error.
El buscador solo debe mostrar alumnos del mismo grupo_id que el líder.
HU-03
Como Docente, quiero ver solo los proyectos de mis grupos asignados, para agilizar mi proceso de evaluación.
El Dashboard del docente debe filtrar los proyectos mediante la relación grupo_docente == grupo_proyecto.
HU-04
Como Invitado, quiero ver un video corto (Pitch) del proyecto, para entender la propuesta en menos de un minuto.
El sistema debe permitir el embed de un video de YouTube/Drive en el Canvas.

3. Artefactos de UX (Punto 2.c.b)
3.1. Proto-Persona: "Jose, el Dev Estresado"
Hechos: Alumno de 5to cuatrimestre de DSM. Usa VS Code, GitHub y Teams.
Problemas: Siente que sus proyectos integradores se pierden al final del cuatrimestre y no tiene cómo mostrarlos a empresas.
Necesidades: Un lugar centralizado donde su código y su arquitectura tengan visibilidad profesional.
3.2. Método AEIOU (Contexto de Uso)
Activities: Los alumnos suben avances de integradora, los docentes comentan en tiempo real.
Environments: Aula de cómputo, dispositivos móviles (vía responsive), ferias de proyectos.
Interactions: El líder agrega miembros; el docente valida; el invitado observa.
Objects: Laptops, smartphones, prototipos de software (URL).
Users: Estudiantes de DSM, Profesores de la academia de TI, Reclutadores.
4. Estrategia de Identidad (Punto 2.a y 2.b)
Nombre de la App: IntegradorHub: DSM Edition
Concepto de Logo: Una "I" y una "H" entrelazadas formando un nodo de conexión (Network), usando el color verde institucional de la UTM combinado con un azul tecnológico (DSM).
Slogan: "Del aula al mercado: tu código, tu vitrina."
5. Diagrama de Actividades (Flujo de Registro)
Inicio: Usuario ingresa correo institucional.
Decisión: ¿Es matrícula?
Sí: Asignar Rol Alumno $\rightarrow$ Solicitar Grupo $\rightarrow$ Dashboard Alumno.
No: ¿Es nombre de docente?
Sí: Asignar Rol Docente $\rightarrow$ Solicitar selección de Grupos $\rightarrow$ Dashboard Docente.

Especificación de Diagramas: Lógica de Sistema IntegradorHub
Este documento desglosa la complejidad del sistema mediante la descripción técnica de los diagramas requeridos por la materia.
1. Diagrama de Casos de Uso (Arquitectura de Permisos)
Este diagrama define los límites de lo que cada actor puede "disparar" en el sistema.
Actor Alumno (Líder):
CU-01: Autenticarse.
CU-02: Configurar Perfil (Grupo/Matrícula).
CU-03: Crear Proyecto Integrador.
CU-04: Invitar Miembros (Filtro por Grupo).
CU-05: Editar Canvas (Bloques Multimedia).
CU-06: Solicitar Validación a Docente.
Actor Docente:
CU-07: Seleccionar Grupos a Cargo.
CU-08: Visualizar Feed de Proyectos por Grupo.
CU-09: Emitir Feedback Técnico / Validación.
Actor Admin (Tú):
CU-10: Gestionar Catálogo de Materias.
CU-11: Cerrar Ciclo Académico (Snapshot Histórico).
2. Diagrama de Secuencia: "Invitación de Integrante"
Este diagrama explica la complejidad de la "Lógica de Hover" y el "Filtro de Grupo".
Líder (UI): Abre el buscador de integrantes.
Sistema (Frontend): Envía petición GET users WHERE grupo_id == lider.grupo_id.
Base de Datos (Firestore): Retorna lista de alumnos del mismo grupo.
Líder (UI): Escribe nombre del compañero.
Sistema (Frontend): Filtra lista local instantáneamente.
Líder (UI): Hace Hover sobre el nombre de "Juan Pérez".
Sistema (Frontend): Dispara Tooltip mostrando la matrícula guardada en el objeto del usuario.
Líder (UI): Confirma y hace clic en "Agregar".
Sistema (Backend): Actualiza el array miembros en el documento del proyecto.
3. Diagrama de Estados: Ciclo de Vida del Proyecto
Describe las transiciones de seguridad del entregable.
Estado: INICIAL (Borrador): Solo visible por el Líder. Permisos de escritura total.
Estado: DESARROLLO (Privado): Visible por el Squad y el Docente. Habilita el módulo de comentarios técnicos.
Estado: EXHIBICIÓN (Público): Visible por Invitados. El "Modo Edición" se bloquea para ciertos campos (Título/Líder).
Estado: LEGADO (Histórico): Solo lectura global. Nadie puede editar. Activado por el Admin al fin del cuatrimestre.
4. Diagrama de Arquitectura Física
Capa 1 (Presentación): React 18 + Tailwind CSS (Estilo Teams).
Capa 2 (Servicios): Firebase Auth (Google Provider) + Custom Hooks para filtrado.
Capa 3 (Datos): Firestore (Estructura de Colecciones /public/data/).
Capa 4 (Storage): Firebase Storage para capturas de pantalla y PDF One-Pager.

Blueprint de Ingeniería: IntegradorHub (DSM Edition)
1. Stack Tecnológico Definitivo
Backend: .NET 8/9 Web API.
Patrón: CQRS con MediatR.
Persistencia: Google Cloud Firestore (vía SDK de .NET).
Frontend: React 18 (Vite).
Arquitectura: Component-Based con Hooks personalizados.
Estilos: Tailwind CSS (Estética Teams/Notion).
2. Arquitectura del Backend (C# .NET)
Usaremos una estructura de Clean Architecture para soportar el patrón CQRS.
A. Capa de Dominio (Entities)
Definimos los objetos que no dependen de ninguna tecnología externa.
User: Entidad con lógica de validación de dominio (matrícula, rol).
Project: El agregado principal (Aggregate Root) que contiene el Squad y los bloques del Canvas.
B. Capa de Aplicación (CQRS)
Aquí es donde vive MediatR para separar comandos de consultas.
Commands (Escritura):
CreateProjectCommand: Crea el documento inicial.
UpdateProjectCanvasCommand: Actualiza los bloques estilo Notion.
AddSquadMemberCommand: Valida que el miembro sea del mismo grupo antes de agregarlo.
Queries (Lectura):
GetProjectsByGroupQuery: Retorna proyectos filtrados por el contexto del alumno/docente.
GetProjectSummaryQuery: Optimizado para la galería de invitados.
3. Arquitectura del Frontend (React 18)
El frontend se organiza por Responsabilidad de Componente.
Atomic Components: Botones, inputs y el TooltipMatricula.
Molecules: ProjectCard, SquadMemberItem.
Organisms: CanvasEditor (El motor estilo Notion), SidebarNavigation.
Hooks: useAuth (maneja la sesión y el rol), useSquad (maneja el filtrado en tiempo real).
4. Flujo de Datos (Data Journey)
React dispara una acción (ej. "Agregar Compañero").
El Hook envía un POST al endpoint de .NET.
El Controller de .NET recibe la petición y envía un Command a MediatR.
El Handler valida la regla: "¿El ID_Grupo del líder coincide con el del compañero?".
Si es válido, el Repository actualiza Firestore.
Firestore retorna el éxito y la UI de React actualiza el estado local.

Estructura de Proyecto: IntegradorHub (DSM Edition)
Esta es la jerarquía de archivos diseñada para soportar CQRS (.NET) y Component-Based UI (React).
📂 /backend (C# .NET Web API)
Dividido bajo los principios de Clean Architecture.
📁 1. IntegradorHub.Domain
El corazón del sistema. Aquí no hay dependencias de bases de datos o frameworks.
Entities/: User.cs, Project.cs, CanvasBlock.cs, Group.cs.
Interfaces/: IFirestoreRepository.cs, IAuthService.cs.
ValueObjects/: Email.cs (Aquí iría la lógica de validación de correo institucional).
📁 2. IntegradorHub.Application
Implementación de CQRS. Aquí vive la orquestación del negocio.
Common/: DTOs (Data Transfer Objects) y Mappers.
Projects/:
Commands/: CreateProjectCommand.cs, AddSquadMemberCommand.cs.
Queries/: GetProjectsByGroupQuery.cs, GetProjectDetailsQuery.cs.
Handlers/: Los cerebros que ejecutan la lógica de los comandos y consultas.
Auth/:
Handlers/: IdentifyUserRoleHandler.cs (Lógica para separar Alumno/Docente).
📁 3. IntegradorHub.Infrastructure
Detalles técnicos y conexiones externas.
Persistence/: FirestoreContext.cs, Repositories/FirestoreRepository.cs.
Services/: FirebaseStorageService.cs.
Configuration/: Configuración de Firebase Admin SDK.
📁 4. IntegradorHub.API (Presentation)
Los endpoints que el Frontend consumirá.
Controllers/: ProjectsController.cs, AuthController.cs, AdminController.cs.
Middlewares/: ErrorHandlerMiddleware.cs.
Program.cs: Configuración de Inyección de Dependencias y MediatR.
📂 /frontend (React 18 + Vite)
Basado en una arquitectura de componentes escalable.
📁 /src
api/: Configuración de Axios y llamadas a los endpoints de .NET.
assets/: Imágenes, logos de la UTM y estilos globales.
components/:
layout/: Sidebar.jsx (Estilo Teams), Navbar.jsx.
shared/: Button.jsx, Input.jsx, MatriculaTooltip.jsx.
project/: CanvasEditor.jsx (Motor Notion), ProjectCard.jsx.
auth/: LoginForm.jsx.
context/: AuthContext.jsx (Estado global del usuario y su rol).
hooks/: useProjectEditor.js, useGroupFilter.js.
pages/:
Login.jsx
Dashboard.jsx (Vista según rol).
ProjectCanvas.jsx (Modo edición).
Showcase.jsx (Galería pública).
routes/: Configuración de rutas privadas y públicas.
utils/: validators.js (Regex de correo para feedback inmediato en UI).
🎯 ¿Dónde va la Lógica Específica?
Reconocimiento de Rol por Email:
Frontend: En utils/validators.js para dar feedback visual inmediato.
Backend: En IntegradorHub.Application/Auth/Handlers/IdentifyUserRoleHandler.cs para asignar el rol real en la base de datos al momento del registro.
Filtro de Grupo y Docente:
Backend: En los Handlers de las Queries. La consulta a Firestore ya viene filtrada desde C# para que el Alumno nunca vea datos que no le corresponden.
Frontend: En el hook useGroupFilter.js, que consume los datos filtrados del backend.
Lógica de Hover (Matrícula):
Frontend: En el componente MatriculaTooltip.jsx. Es una lógica puramente de UI que usa estados locales de React (onMouseEnter/onMouseLeave).
Modo Edición Notion:
Frontend: En components/project/CanvasEditor.jsx. Maneja un array de objetos (bloques) que se sincroniza con .NET mediante el comando UpdateProjectCanvasCommand.



Explicación de la Estructura (Vertical Slice + Feature Folders)
 Backend (.NET 8/9 Web API)
En lugar de dividir por "Capas Técnicas" (Controllers, Services, Repositories), dividimos por Features (Funcionalidades).
Features/: Es el directorio principal. Aquí vive el 90% de tu código.
Cada carpeta es una "Rebanada": Por ejemplo, dentro de Projects tendrás una subcarpeta Create. Adentro de Create están el Endpoint (API), el Command (Datos), el Handler (Lógica) y el Validator (Reglas).
Por qué es mejor: Cuando el alumno quiera cambiar cómo se crea un proyecto, no tiene que navegar por 5 carpetas distintas. Todo está en un solo lugar.
Shared/ (El Núcleo Común): Aquí ponemos lo que realmente se comparte entre features.
Domain/: Las Entidades puras (User, Project). Aunque usamos Vertical Slice, necesitamos definiciones comunes de qué es un "Usuario" para que todos hablen el mismo idioma.
Infrastructure/: La configuración "dura" de Firebase (FirestoreContext). Las Features consumen esto, pero no lo definen.
Behaviors/: Aquí va la magia de MediatR. Configuramos validaciones automáticas y manejo de logs para que no tengas que escribir try-catch en cada archivo.
Frontend (React + Vite)
El Frontend espejea la estructura del Backend para reducir la carga cognitiva (Escalabilidad Mental).
src/features/: Igual que en el backend.
project-canvas/: Contiene todo lo necesario para el editor tipo Notion (Componentes, Hooks específicos, API calls).
auth/: Manejo de Login y detección de Roles.
src/components/ui/: Componentes "tontos" y reutilizables. Un botón, un input, el MatriculaTooltip. Estos no saben de lógica de negocio, solo de estética.
src/lib/: Configuración de librerías externas (Instancia de Axios, Inicialización de Firebase Client).

/IntegradorHub-Root
│
├── /backend (Solución .NET 8/9 - Vertical Slice Architecture)
│   ├── /src
│   │   ├── /IntegradorHub.API
│   │   │   │
│   │   │   ├── /Features                  <-- AQUÍ VIVE TU NEGOCIO
│   │   │   │   ├── /Auth
│   │   │   │   │   ├── /Login             (Endpoint + Handler + Validator)
│   │   │   │   │   └── /IdentifyRole      (Lógica de Regex @utmetropolitana)
│   │   │   │   │
│   │   │   │   ├── /Projects
│   │   │   │   │   ├── /Create            (CreateProjectCommand.cs, Handler.cs)
│   │   │   │   │   ├── /EditCanvas        (UpdateBlocksCommand.cs)
│   │   │   │   │   ├── /GetByGroup        (Query filtrada por ID_Grupo)
│   │   │   │   │   └── /AddMember         (Lógica de validación de grupo)
│   │   │   │   │
│   │   │   │   └── /Evaluations
│   │   │   │       └── /SubmitFeedback    (Lógica Docente vs. Invitado)
│   │   │   │
│   │   │   ├── /Shared                    <-- EL PEGAMENTO TÉCNICO
│   │   │   │   ├── /Domain                (Entidades: User.cs, Project.cs)
│   │   │   │   ├── /Infrastructure        (FirestoreContext.cs, FirebaseStorage.cs)
│   │   │   │   └── /Abstractions          (Interfaces: ICurrentUserService)
│   │   │   │
│   │   │   ├── Program.cs                 (Inyección de MediatR y Configuración)
│   │   │   └── appsettings.json           (Credenciales de Firebase - NO SUBIR A GIT)
│
│
├── /frontend (React 18 + Vite - Feature Based)
│   ├── /src
│   │   ├── /features                      <-- MÓDULOS AUTOCONTENIDOS
│   │   │   ├── /auth
│   │   │   │   ├── /components            (LoginForm.jsx)
│   │   │   │   └── /hooks                 (useAuth.js - Detecta Rol)
│   │   │   │
│   │   │   ├── /project-canvas
│   │   │   │   ├── /components            (BlockEditor.jsx, ImageDropzone.jsx)
│   │   │   │   ├── /api                   (createProject.js, updateCanvas.js)
│   │   │   │   └── /hooks                 (useProjectAutoSave.js)
│   │   │   │
│   │   │   └── /showcase
│   │   │       └── /components            (GalleryGrid.jsx, FilterBar.jsx)
│   │   │
│   │   ├── /components                    <-- COMPONENTES GENÉRICOS (UI KIT)
│   │   │   ├── /ui                        (Button.jsx, Card.jsx, Badge.jsx)
│   │   │   └── /feedback                  (MatriculaTooltip.jsx, Toast.jsx)
│   │   │
│   │   ├── /lib                           <-- INFRAESTRUCTURA FRONTEND
│   │   │   ├── axios.js                   (Interceptors para Tokens)
│   │   │   └── firebase.js                (Cliente SDK)
│   │   │
│   │   ├── /routes                        (Router.jsx - Protección por Roles)
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── /docs                                  <-- DOCUMENTACIÓN DEL PROYECTO
    ├── /architecture                      (Diagramas C4, Modelo de Datos)
    └── /user-manuals                      (Guías para Docentes y Alumnos)
