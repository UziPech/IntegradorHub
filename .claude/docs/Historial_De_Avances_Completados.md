# 📜 Historial de Tareas y Características Completadas

Este documento sirve como bitácora y registro de las características, módulos y correcciones que han sido finalizadas con éxito en el sistema IntegradorHub.

---

## 🖥️ Refactorización UI: Sidebar Responsivo y Nueva Identidad (Febrero 2026)

### 1. Menú Lateral Inteligente (Desktop & Mobile)
- **Desktop (Hover-to-Expand):** Se rediseñó el `Sidebar` para comportarse como una "Píldora" colapsada por defecto (ahorrando espacio en la pantalla). Al pasar el cursor, el menú se expande fluidamente revelando los textos de navegación completos, usando transiciones nativas de Tailwind CSS sin librerías externas.
- **Mobile (Drawer Modal):** En dispositivos móviles, la lógica _hover_ se desactiva. En su lugar, el `DashboardLayout` ahora incluye un elegante **Topbar** con un botón de menú tipo "Hamburguesa". Al tocarlo, el menú lateral se desliza (Drawer) superponiéndose a la pantalla junto con un fondo oscurecido (Overlay). El menú se auto-cierra al seleccionar una opción.

### 2. Identidad Corporativa (Tema Monocromático)
- Se sustituyó el logo temporal ("B" degradada) por el ícono corporativo oficial de **Byfrost** (el "Puente"). 
- El esquema de colores del sistema de navegación fue ajustado para seguir una estética **limpia, blanca y profesional**. Los íconos inactivos usan tonos grises (`slate-400`/`500`), el texto activo e íconos usan tonos muy oscuros (`gray-900`), logrando una Interfaz de Usuario de tipo "Dashboard Corporativo" libre de ruidos visuales distractores.

### 3. Escalado Dinámico de Elementos (Íconos)
- Para aprovechar el espacio cuando el menú está colapsado en pantallas grandes (Desktop), se creó un sistema de redimensionamiento matemático responsivo.
- Los íconos de navegación (junto con el botón de logout y la foto de perfil) aumentan considerablemente su tamaño automáticamente para lucir prominentes mientras están colapsados. Al expandir el panel o cambiar a vista móvil, los íconos regresan fluida y proporcionalmente a su tamaño normal para encajar armónicamente con los textos.

---

## 🔗 Redes Sociales y Perfiles Públicos de Solo Lectura (Febrero 2026)

### 1. Sistema Modular de Enlaces Sociales (Backend & Frontend)
- **Persistencia Flexible:** Se integró un nuevo campo `RedesSociales` (tipo Diccionario) a los perfiles en Firestore. Esto evita "hardcodear" columnas y permite almacenar un número dinámico de plataformas sociales.
- **Endpoints de Actualización (`UsersProfileController.cs`)**: Se creó la ruta `PUT /api/users/{userId}/social` controlada por `UpdateSocialLinksHandler.cs`. Dicho handler fue diseñado para fusionar inteligentemente los enlaces nuevos con los existentes, permitiendo agregarlos 1x1, editarlos o purgar enlaces vacíos, valiéndose de resoluciones de mapeo en Diccionarios con `SetOptions.MergeAll`.
- **Panel de Configuración Interactivo (`ProfilePage.jsx`)**: Se rediseñó la experiencia de usuario agregando la "Caja de Herramientas Social". Ahora los usuarios pueden insertar URLs de Github, LinkedIn, Twitter, Website o YouTube, desplegándose en elegantes pastillas flotantes (Badges) con iconos nativos.

### 2. Visores de Perfiles Públicos (Modo Social)
- **Extracción Segura (`PublicProfileDto`)**: Se expuso la ruta `GET /api/users/{userId}/profile` que exporta un DTO higienizado conteniendo únicamente datos inofensivos para proteger la identidad y privacidad del titular frente a visitantes curiosos.
- **Reciclaje Inteligente de Vistas (`ProfilePage.jsx`)**: En lugar de crear pantallas duplicadas, se capitalizó la robusta UI del "Perfil Privado". El sistema inyecta una guardia booleana (`isOwnProfile`) que detecta visitantes externos (mediante parámetros `/profile/:userId`) para blindar el perfil, ocultando los controles de subida de fotos y botones de edición de forma incondicional, dejando una nítida tarjeta de "Solo Lectura".

### 3. Hiper-Navegabilidad Transversal (Frontend)
- **Social Graph en IntegradorHub**: Fomentando el sentido de comunidad, ahora cualquier usuario puede explorar los perfiles de todos los creadores de software del ecosistema. 
- La arquitectura cobró vida al envolver con componentes interactivos los avatares en los puntos neurálgicos más importantes del portal:
  - La Galería Pública de Proyectos (`ShowcaseCard`).
  - La ventana de Detalles y Creadores (`ProjectDetailsModal`).
  - El Directorio del Aula Virtual (`TeamPage`).
  - El Panel de Listado "Mis Proyectos" (`ProjectsPage`).

---

## ✅ Módulo de Registro y Asignación de Docentes (Febrero 2026)

### 1. Sistema de Asignación Inteligente (Backend)
- Se desarrolló el endpoint `/api/admin/materias/available` en `MateriasController.cs`.
- Se implementó la lógica en `MateriaHandlers.cs` (`GetAvailableMateriasHandler`) para que el sistema consulte dinámicamente qué materias tienen grupos disponibles y qué grupos pertenecen a cierta carrera, evitando asignaciones a grupos fantasma o vacíos.

### 2. Formulario de Registro Dinámico en Cascada (Frontend)
- Se refactorizó por completo el componente `LoginPage.jsx` para el rol de `Docente`.
- Se introdujo un formulario progresivo tipo cascada:
  1. El docente elige su **Carrera**.
  2. El sistema filtra y le permite elegir una **Materia** disponible de esa carrera.
  3. El sistema muestra los **Grupos** específicos de esa materia para que el docente seleccione uno o varios.
- La carga de datos (payload) de registro se actualizó para enviar el arreglo complejo de `Asignaciones` al backend.

### 3. Solución de "Race Condition" en la Creación de Usuarios (Fullstack)
- **El Problema:** Al registrarse un nuevo docente con Google, su nombre completo y materias se perdían, quedando con el nombre por defecto "Usuario" y sin asignaturas. Esto ocurría porque Firebase activaba el inicio de sesión automático instantáneo (`LoginHandler`) que sobreescribía el registro original detallado (`RegisterHandler`) que se estaba procesando al mismo tiempo.
- **La Solución:**
  - **Backend:** Se construyó una nueva barrera de seguridad `CreateIfNotExistsAsync()` en el repositorio de usuarios (`UserRepository.cs`) utilizando la capacidad nativa de Firestore para evitar la sobreescritura si el documento ya fue creado.
  - **Frontend:** Se eliminó la escritura redundante (`setDoc`) directa a la base de datos que existía en el hook `useAuth.jsx`. Ahora el Backend de C# es nuestra única fuente de la verdad para modificaciones a los perfiles de usuario.
- **Resultado:** Los nombres reales (incluyendo nombres compuestos largos o cortos) y las asignaciones de todos los nuevos docentes ahora se guardan intactos y a la primera.

### 4. Auditoría y Limpieza de Datos (Base de Datos Firestore)
- Se generaron scripts de limpieza profunda para eliminar datos corruptos o de prueba.
- Se depuraron las colecciones `users`, `projects` y `evaluations`.
- Se establecieron protocolos para mantener viva e intacta la cuenta de administrador principal (`uzielisaac28@gmail.com`) durante las limpiezas destructivas.

---
*Fin del registro de esta actualización.*

---

## 🎨 Rediseño del Componente y Galería de Proyectos `ShowcaseCard` (Febrero 2026)

### 1. Formato y Relación de Aspecto
- Se reemplazó la anticuada proporción cuadrada (`aspect-square`) por un inmersivo formato panorámico u horizontal (`aspect-video`) idóneo para aplicaciones de software web y móvil.
- El contenedor de la tarjeta ahora utiliza un sistema de `max-w-4xl` en el grid de una sola columna, dotando al proyecto de un espacio privilegiado para mostrar sus detalles, similar a un feed profesional.

### 2. Implementación de "Caja de Luz" Interactiva (Lightbox)
- Se desarrolló e integró un componente de `Lightbox` personalizado cuando el usuario hace un clic en el "Pitch".
- Este "Lightbox" no secuestra el navegador, sino que genera una elegante capa semitransparente color negro al 95% para oscurecer la galería y centrar la atención.
- Se incluyeron controles dedicados: un botón de "Cerrar" en la esquina, e indicadores `dots` de paginación para cambiar rápidamente entre video e imágenes sin abandonar el modo inmersivo.

### 3. Fusión Orgánica Multimedia
- Se actualizaron todos los fondos que colindan con el contenido multimedia (Imágenes y Videos) de `bg-gray-100` y `bg-gray-900` hacia `bg-black` puro.
- El contenido ahora usa `object-contain` en lugar de `cover`. Con el fondo negro integrado, las diferencias de relación de aspecto de las capturas (algunas más altas, algunas más chatas) se disfrazan mediante elegantes bandas negras que emulan el "letterbox" cinematográfico o panorámico sin mutilar los bordes de la imagen con recortes bruscos.

### 4. Feed de Navegación "Infinita" Orgánica
- Se detectó un problema de solapamiento jerárquico (`Z-Index`) al momento de hacer scroll donde el componente `Ranking Badge` interactuaba mal con la cabecera del sitio.
- Se retiró el la propiedad "fija" (`sticky top-0`) de la cabecera `Galería de Proyectos`. Esto dota a la página de "Showcase" de una fluidez natural donde el encabezado principal otorga contexto al aterrizar, pero retrocede y cede el protagonismo al contenido al momento de explorar la lista de estudiantes, emulando la clásica UX de un "feed" de red social.

---
*Fin del registro de esta actualización.*

---

## 🚀 Mejoras en Modal de Detalles de Proyectos y Sincronización de Datos (Febrero 2026)

### 1. Rediseño del Componente `ProjectDetailsModal` (Estilo Instagram)
- Se reestructuró el modal de detalles del proyecto adoptando un diseño de dos columnas (Master-Detail).
- La columna izquierda ahora está dedicada íntegramente a un carrusel multimedia interactivo y centralizado, soportando tanto imágenes como video pitches interactivos.
- La columna derecha agrupa la información vital: metadatos del equipo, documento del Canvas Editor y la sección de evaluaciones.
- Se eliminaron pantallas de "Cargando..." artificiales, permitiendo una renderización casi instantánea.

### 2. Carrusel Multimedia Integrado
- Se reemplazó el antiguo diseño donde las imágenes y videos se apilaban verticalmente formando columnas interminables.
- Ahora, el carrusel de `ProjectDetailsModal` hereda la misma fluidez y controles del `ShowcaseCard`, incluyendo flechas de navegación y dots indicadores para una UX homogénea en todo IntegradorHub.

### 3. Sincronización del Text-Editor y Resoluciones en Tiempo Real
- **Misterio del Editor Vacío:** Se detectó un glitch visual donde el texto elaborado en el `CanvasEditor` (descripción del proyecto) no se visualizaba al primer clic en la tarjeta debido a componentes que no se refrescaban al completarse la carga asíncrona (Async data fetching).
- **La Solución (Frontend):** Se inyectó robustez al ciclo de vida del componente mediante una clave o `key` dinámica. Ahora el modal fuerza a que el editor principal se vuelva a ensamblar desde cero justo cuando la base de datos termina de enviar la información, garantizando que todo el contenido aparezca a la primera sin recargar la página.
- **Icono de Creador "L":** Se solucionó un error lógico en la prioridad de renderización que causaba que el Avatar del Creador mostrara por error la inicial "L" (de Líder). 

### 4. Inteligencia en Extracción de Textos para Tarjetas (Backend)
- **El Problema:** Ciertas tarjetas (`ShowcaseCard`) en la galería pública mostraban "Sin descripción disponible" a pesar de que los alumnos sí habían escrito texto en su proyecto. Esto sucedía porque, a nivel estructural, el editor de texto introducía de manera invisible bloques HTML vacíos (`<p><br></p>`).
- **La Solución (Backend):** Se optimizó la lógica central del endpoint de listado público en C# (`GetPublicProjectsHandler.cs`). Ahora, antes de pre-visualizar el resumen para la galería, el backend realiza una desinfección (limpieza con Expresiones Regulares `Regex`) que ignora las etiquetas HTML muertas y busca el primer bloque que contenga texto real para mostrarlo elegantemente a los visitantes como la verdadera descripción.

---
*Fin del registro de esta actualización.*

---

## 📊 Rediseño y Optimización de Dashboards (Alumno y Docente) (Febrero 2026)

### 1. Dashboard de Alumnos (Bento Grid)
- Se desarrolló el nuevo componente `StudentDashboard.jsx` adoptando un diseño moderno estilo "Bento Grid".
- **Métricas Rápidas:** Se agregaron tarjetas de estadísticas (`StatCard`) para mostrar la fracción de miembros del equipo, el estado de evaluación oficial y un indicador inteligente de "Listo para evaluar" (que calcula si han pasado más de 2 días desde la creación del proyecto).
- **Rendimiento Visual:** Se integró la librería `recharts` para mostrar una gráfica de línea de tiempo del proyecto (`ProjectTimelineChart`), proyectando de manera gráfica la evolución del estado del proyecto.
- **Búsqueda de Compañeros:** Se integró el panel lateral `TeamSuggestions` para sugerir proactivamente a los estudiantes sin equipo que se unan al proyecto actual, fomentando la colaboración.
- **Correcciones:** Se solucionó un bug de carga donde la información de los miembros se mostraba oscilante o vacía en el renderizado inicial al mapear correctamente las propiedades del modelo (incluyendo `calificacion` y `puntosTotales`).

### 2. Dashboard de Docentes (Atención Prioritaria)
- Se implementó `TeacherDashboard.jsx` diseñado específicamente para resolver las necesidades del flujo de revisión.
- **KPIs Educativos:** Se despliegan contadores en tiempo real mostrando "Proyectos Totales", "Proyectos Aprobados" (basado en una calificación >= 70) y "Listos para Evaluar".
- **Filtro de Relevancia:** Se diseñó una sección de "Atención Prioritaria" que aísla visualmente los proyectos críticos. El sistema clasifica automáticamente a un proyecto como "Listo para Evaluar" únicamente si el equipo lo ha marcado como Público (`esPublico === true`) y el docente AÚN no le ha asignado una calificación.
- **Extensión del Backend C#:** Se reconfiguraron los Data Transfer Objects (DTOs) en `GetProjectsByTeacherHandler.cs` y `GetProjectsByGroupHandler.cs` para transportar los campos `EsPublico`, `CreatedAt` y `Calificacion` hacia el frontend, empoderando los filtros del Dashboard.

### 3. Fluidez y Corrección de Estados
- **Arreglo del "Efecto Fantasma" en Animaciones:** Se detectó que las métricas (`StatCard`s) a veces no se mostraban tras el inicio de sesión. El problema provenía de un conflicto de estados encadenados heredados en `framer-motion`. Se reprogramó cada componente para gobernar individualmente sus propias animaciones iniciales (`initial` y `animate`), garantizando la aparición garantizada y ultra fluida al recargar o cambiar de datos rápidos.

---
*Fin del registro de esta actualización.*

---

## ⚡️ Optimización de Galería y Exportación PDF (Febrero 2026)

### 1. Eliminación de Cuello de Botella (N+1) en Galería
- **Problema:** En `GetPublicProjectsHandler.cs`, el servidor hacía peticiones secuenciales a la base de datos por cada proyecto público para obtener los datos de sus líderes y docentes, causando "lag" al cargar la Galería de Showcase.
- **Solución:** Se transformó el algoritmo a un procesamiento en paralelo y búsqueda por diccionario usando `Task.WhenAll`. Ahora se extraen los IDs únicos y se lanza una única ráfaga a Firestore, reduciendo masivamente los tiempos de espera y entregando una experiencia de listado de proyectos fluida sin alterar los envíos de datos del Frontend.

### 2. Generación Avanzada de PDF (`ProjectPDFExport`)
- **Innovación en Cliente:** Se desarrolló un nuevo componente dinámico en React (`ProjectPDFExportButton`) interactuando con las librerías `html2canvas` y `jsPDF`. Permite a los usuarios exportar instantáneamente el contenido pesado de los proyectos como un reporte imprimible multipágina en formato A4 garantizando alta definición de texto e imágenes (scale x2).
- **Template Neutro y CSS-Safe:** Se diseñó una plantilla estática ciega y blindada contra motores de render conflictivos. Para evadir la limitación impuesta por el nuevo soporte web de colores `oklch()` en Tailwind v4, se anularon sus selectores en este contexto mediante la inyección del tag `<style>` y el uso estricto de colores Hexadecimales (`#FFFFFF`, `#111827`) en formato `inline`, logrando que html2canvas interprete el DOM a la perfección sin colapsar el explorador.
- **Manejo Robusto de Integración Web:** 
  - Artefactos SVG complejos (Lucide) se reemplazaron transitoriamente por glifos universales neutros para neutralizar crashes nativos en el dibujo.
  - Se orquestó la política dinámica de peticiones asíncronas para imágenes Firebase removiendo el tag rígido `crossOrigin` por el flexible flag global `useCORS`.
  - Se engranó el motor con `allowTaint: true` e inyecciones de prórroga natural (`setTimeout`) para permitir que la ausencia o desconexión de un asset externo no mutile e impida la expedición del documento completo por completo de forma catastrófica.
  - Los avatares dinámicos (iniciales) se recalcularon usando directivas arcaicas garantizadas como CSS `inline-block` y dimensiones fijas en lugar de Flexbox y auto-alineaciones, destrabando colapsos para renderizar bordes 50% perfectos sin distorsión.
- **Conectividad QR Bridge:** Se instaló un generador matemático nativo (`react-qr-code`) anclado al header superior. Imprime firmemente y en tiempo real el código escaneable del link público de cada uno de los proyectos. Permitiéndole a examinadores o reclutadores obtener interatividad total del proyecto leyendo un folio en papel en el mundo real hacia un SmartPhone en apenas un instante.

---
*Fin del registro de esta actualización.*

---

## 📸 Funcionalidad de Foto de Perfil y Mejoras de UI (Febrero 2026)

### 1. Sistema Integral de Avatares (Frontend & Backend)
- **Subida a Storage:** Se integró un botón "Cámara" en la página de perfil (`ProfilePage.jsx`) que sube de forma asíncrona la imagen a Supabase Storage mediante un endpoint existente.
- **Persistencia en Base de Datos:** Se creó el endpoint `PUT /api/users/{id}/photo` en `UsersProfileController.cs` apoyado por el handler `UpdateProfilePhotoHandler.cs` para actualizar y persistir de manera resiliente el campo `FotoUrl` en el documento del usuario en Firestore.
- **Componente Universal `UserAvatar`:** Se desarrolló un componente reutilizable de React robusto. Este componente renderiza de manera segura la foto de perfil o, en caso de que la imagen sea nula o tenga un enlace roto, genera un "fallback" elegante renderizando la inicial del usuario con los colores del sistema. 

### 2. Propagación Global de Avatares
- Se refactorizaron 5 componentes críticos de la aplicación para desterrar los avatares hardcodeados (inicial manual en un `div`) y utilizar el nuevo componente inteligente `UserAvatar`.
- **Componentes actualizados:** 
  - `Sidebar.jsx` (Información del usuario autenticado en la esquina inferior).
  - `ShowcaseCard.jsx` (Avatar del líder del proyecto en la galería pública). **Nota:** Para esto fue necesario extender el DTO público de proyectos en `GetPublicProjectsHandler.cs` exportando el campo `LiderFotoUrl`.
  - `ProjectDetailsModal.jsx` (Avatares del creador del proyecto y su equipo).
  - `TeamPage.jsx` (Directorio de compañeros de clase y miembros de proyecto).
  - `CreateProjectForm.jsx` (Mural dinámico de estudiantes al formar equipo).

### 3. Correcciones Quirúrgicas de Interfaz (Profile UI)
- **Formato Circular del Avatar:** Se arregló un glitch visual donde el contenedor dinámico deformaba los avatares haciéndolos con forma de "cuadrados chuecos". Al abstraer a un div estricto `w-44 h-44 shrink-0` y aplicando utilidades a sub-elementos absolutos (como el icono de cámara flotante centrado), se logró el círculo perfecto garantizado de la maqueta original.
- **Resolución Inteligente de Carrera:** Anteriormente, la tarjeta de Carrera imprimía ciegamente el Hash de Firestore. Ahora, el sistema detecta IDs asimétricos e invoca al vuelo el endpoint maestro `/api/admin/carreras`, interpolando en pantalla el nombre real y legible de la entidad (ej: "Desarrollo y Gestión de Software").
- **Visualización Condicional de Campos "Vacíos":** Se eliminó el comportamiento de la tarjeta (`InfoCard`) que imprimía textos anti-estéticos como "---" o "No registrado". Ahora la UI evalúa dinámicamente si campos opcionales como `Especialidad` (Docentes), `Organización` (Invitados) o `Teléfono` realmente existen. Si el backend entrega valores nulos, el contenedor simplemente no se crea en pantalla para mantener una tarjeta minimalista y enfocada en lo que sí hay.
- **Desbordamiento de Texto Controlado:** Se reemplazó la primitiva utilidad `truncate` que ocultaba prematuramente datos valiosos en dispositivos móviles (ej: mutilando direcciones de correo) hacia estrategias semánticas como `break-words` y `break-all` garantizando una lectura multilinea y de adaptabilidad horizontal 100% fluida.

---
*Fin del registro de esta actualización.*

---

## 🔐 Refinamiento de Autenticación y Mejoras de UI en Dashboard (Febrero 2026)

### 1. Corrección Crítica en Lógica de Login (Frontend)
- **El Problema:** Al ingresar una contraseña incorrecta para una cuenta existente, Firebase Auth arroja el error genérico `auth/invalid-credential` (por motivos de seguridad anti-enumeración de cuentas). La aplicación asumía erróneamente que cualquier error de este tipo significaba "Usuario No Encontrado" e inmediatamente redirigía al usuario a la pantalla de "Completar Registro".
- **La Solución:** Se refactorizó la función `handleLogin` en `LoginPage.jsx` implementando un patrón de "Sonda de Creación". Cuando ocurre el error genérico, el sistema intenta ejecutar internamente un `createUserWithEmailAndPassword`:
  - Si Firebase rechaza la creación con el error `auth/email-already-in-use`, el sistema **comprueba** matemáticamente que el usuario SÍ existe pero introdujo una contraseña incorrecta, mostrando el mensaje adecuado ("Contraseña incorrecta. Verifica tu contraseña e intenta de nuevo.").
  - Si la creación tiene **éxito**, se comprueba que el usuario era genuinamente nuevo. Acto seguido, la cuenta temporal se elimina silenciosamente y al usuario se le redirige correctamente al formulario para completar su información.
- Se agregó también manejo explícito para el error `auth/too-many-requests`.

### 2. Pulido de UI en Formularios de Autenticación
- **Selector de Visibilidad de Contraseña:** Se integró un botón interactivo (ícono de ojo de `lucide-react`) dentro del campo de contraseña en `LoginPage.jsx`, permitiendo a los usuarios revelar u ocultar el texto de su contraseña para mayor comodidad y prevención de errores tipográficos.
- **Micro-interacciones y Compactación:** Se crearon nuevos estilos CSS-in-JS (`inputCompact`, `selectCompact`, `passwordWrapper`, `passwordToggle`) para reducir los espacios muertos (paddings verticales y fuentes) en el formulario de registro extendido, dándole un aspecto visual mucho más denso y profesional, evitando que el usuario necesite hacer un scroll excesivo.

### 3. Solución de Mapeo de Datos en Dashboard (Alumnos)
- **El Problema:** La sección "Encuentra a tu equipo" en `StudentDashboard.jsx` mostraba nombres genéricos como "US" e "Ingeniería" para los compañeros de grupo, a pesar de que el backend ya enviaba la información real a través del endpoint `/api/teams/available-students`.
- **La Solución:** Se actualizó el componente dependiente `TeamSuggestions.jsx` porque estaba intentando extraer variables anticuadas (`student.nombre` y `student.carrera`). Ahora mapea correctamente la estructura del Backend contemporáneo leyendo `student.nombreCompleto` y `student.matricula`. 
- **Mejora de UI Cortesia:** Aprovechando el rediseño, las tarjetas de estudiantes sugeridos se centraron por completo en su contenedor, y se les añadió la lógica para renderizar la foto de perfil en tiempo real (`student.fotoUrl`) mediante el componente circular, empleando un fallback de iniciales estilizadas si la foto es nula.

---
*Fin del registro de esta actualización.*

---

## 👥 Mejoras en el Buscador y Agregado de Miembros de Proyecto (Febrero 2026)

### 1. Interfaz de Autocompletado Integrada (Frontend)
- Se reemplazó el antiguo campo de texto en `ProjectDetailsModal.jsx` por un moderno componente de autocompletado interactivo (Dropdown/Combobox).
- Ahora, al intentar agregar un nuevo integrante, el líder del proyecto puede buscar dinámicamente a sus compañeros de clase ingresando su nombre o matrícula.
- Los resultados se muestran en tiempo real e incluyen la foto de perfil (usando `UserAvatar`), nombre completo y matrícula para una selección visual y precisa.

### 2. Sincronización Rigurosa del Grupo (Backend)
- **El Problema:** El buscador de compañeros disponibles siempre se reportaba vacío. Esto descubrió un fallo estructural: el backend omitía el identificador del grupo (`GrupoId`) al entregar el resumen del proyecto. El Frontend al desconocer el grupo, consultaba "todos los alumnos disponibles del grupo: undefined", obteniendo cero resultados. 
- **La Solución:** Se refactorizó la estructura base (`ProjectDetailsDto`) y sus controladores (`GetProjectDetailsHandler.cs`, `GetProjectByMemberHandler.cs`) para incluir y propagar el `GrupoId`. Ahora, el panel garantiza proponer únicamente alumnos de la misma clase (grupo).

### 3. Persistencia de Asignación Bidireccional
- Se arregló una vulnerabilidad silenciosa en `AddMemberHandler.cs`: Aunque el estudiante se unía al arreglo de "miembros" del proyecto, el perfil del usuario no registraba que ya tenía equipo (`User.ProjectId` quedaba nulo).
- Se implementó la escritura bidireccional obligatoria. El endpoint de alumnos disponibles ahora filtra de forma infalible únicamente a aquellos compañeros sin `ProjectId`, evitando duplicidad o miembros "robados" por otros equipos.

---
*Fin del registro de esta actualización.*

---

## 🔦 Correcciones de Lightbox y Refinamiento de Interfaz (Febrero 2026)

### 1. Sistema de Lightbox Robusto (React Portals)
- **Eliminación de Conflictos de Stacking:** Se migraron los visores de medios (`Lightbox`) de `ProjectDetailsModal` y `ShowcaseCard` hacia un sistema de **React Portals**. Esto garantiza que el lightbox se monte directamente en el `document.body` con un `z-index` de 9999, eliminando bloqueos visuales o fallos de clics causados por animaciones de Framer Motion u `overflow-hidden` en contenedores ancestros.
- **Inmersión 90/90:** Se rediseñó el layout del lightbox para ocupar exactamente el **90% del ancho y alto de la pantalla** (`90vw/90vh`) de forma fija, proporcionando una experiencia cinematográfica independientemente de la resolución original de la imagen o video.

### 2. Estabilidad de Ciclo de Vida (Component Remounting)
- Se implementó la técnica de **Keyed Remounting** en la galería pública. Al asignar `key={selectedProject.id}` al modal de detalles, se asegura un reinicio total de todos los estados internos (carruesel, video, lightbox) al navegar entre proyectos, eliminando comportamientos erráticos o persistencia de datos del proyecto anterior.

### 3. Refinamiento Estético y UX "Zero Noise"
- **Cleanup de Cabecera:** Se eliminaron los badges estáticos de "Borrador" y "Materia" para limpiar el campo visual. La materia se reubicó como un subtítulo elegante, mejorando la jerarquía tipográfica.
- **Controles Contextuales:** El botón de cierre (`X`) del lightbox ahora es inteligente; permanece invisible para no obstruir la vista y aparece mediante un fade-in suave únicamente cuando el usuario interactúa con el cursor sobre la pantalla.
- **Corrección de Hit-Testing:** Se eliminaron las transformaciones CSS de escala (`hover:scale-105`) en las miniaturas de los carruseles, lo que resolvió un bug donde el área visual de la imagen no coincidía con su área de clic real, causando "clicks fantasma".

---
*Fin del registro de esta actualización.*

---

## 🔌 Corrección de Conexión de API (Frontend Local vs Producción) (Febrero 2026)

### 1. Resolución de Sobrescritura de Variables de Entorno
- **El Problema:** El frontend ejecutándose en un entorno local (`localhost:5173`) intentaba forzosamente conectarse al backend local (`http://localhost:5093`), resultando en errores `ERR_CONNECTION_REFUSED` a pesar de haber modificado el archivo `.env` para apuntar a la API productiva en Render (`https://integradorhub.onrender.com`).
- **El Diagnóstico:** La persistencia del error se debía a la existencia de un archivo `.env.local` generado automáticamente por la vinculación del proyecto con Vercel CLI. En Vite, el archivo `.env.local` tiene estricta **mayor prioridad** sobre `.env`, sobrescribiendo cualquier variable que compartan el mismo nombre.
- **La Solución:** Se homologó el valor de la variable `VITE_API_URL` en el archivo `.env.local`, apuntando explícitamente a la infraestructura de producción (`https://integradorhub.onrender.com`).
- **Impacto:** Con esta configuración unificada, el entorno de desarrollo local puede ahora consumir de manera fluida y exitosa los recursos, catálogos y sistemas de autenticación que operan en el entorno en la nube de Render, permitiendo debugear el frontend con datos reales sin tener que ejecutar paralelamente el servidor .NET.


---
*Fin del registro de esta actualización.*

---

## 🌐 Despliegue Frontend a Vercel & Estabilización de CORS (Febrero 2026)

### 1. Solución al Build de Vite (`vite: command not found`)
- **El Problema:** Al intentar desplegar a Vercel, el proceso fallaba inmediatamente al no encontrar el comando `vite build`. Esto ocurría porque GitHub aloja el proyecto completo (monorepo con frontend y backend), y Vercel por defecto intentaba ejecutar el build desde la raíz (`/`), donde no existe el `package.json` de React.
- **La Solución:** Se reconfiguró el proyecto en el dashboard de Vercel estableciendo el _Root Directory_ explícitamente a `frontend`. Además, se introdujo un archivo `vercel.json` con _rewrites_ para soportar la navegación SPA (Single Page Application) de React Router, evitando los errores 404 al recargar páginas o utilizar enlaces directos.

### 2. Configuración Segura de Variables de Entorno
- **El Problema:** Tras lograr que compilara, la aplicación productiva arrojaba un "Pantallazo Blanco" y errores de `auth/invalid-api-key`. Vercel no inyecta los archivos `.env` automáticamente por seguridad.
- **La Solución:** Se inyectaron manualmente (vía interfaz gráfica de Vercel) todas las credenciales maestras omitidas de Firebase (`VITE_FIREBASE_API_KEY`, etc.) y la ruta del backend (`VITE_API_URL` apuntando a Render). Se homologaron estos valores en los perfiles `Production`, `Preview` y `Development`. Para las **Preview URLs** dinámicas de Vercel, también se configuró Firebase Auth para admitir dichos dominios como orígenes autorizados.

### 3. Flexibilidad Total de CORS en .NET Backend
- **El Problema:** Aunque el frontend ya operaba bajo el dominio de `vercel.app`, el backend alojado en Render rechazaba las peticiones por políticas estrictas de CORS, bloqueando la comunicación.
- **La Solución (Backend):** Se refactorizó la política de CORS en `Program.cs`. Sustituyendo la declaración rígida `WithOrigins` por el método de evaluación predictiva estática `SetIsOriginAllowed()`. El nuevo algoritmo acepta cualquier origen que provenga de `localhost`, de `https://integradorhub.onrender.com` o que termine matemáticamente en `.vercel.app`, dotando de flexibilidad impecable a todas las implementaciones sin sacrificar la seguridad básica.

---
*Fin del registro de esta actualización.*

---

## 🧹 Limpieza Masiva y Purga de Testing en Producción (Febrero 2026)

### 1. Borrado Asistido de Cuentas de Prueba (Auth & DB)
- **El Contexto:** Durante los meses de desarrollo, la base de datos se saturó de aproximadamente >50 cuentas de prueba y sus respectivos "proyectos fantasmas", desordenando las métricas de la plataforma antes del pase oficial a Producción.
- **La Ejecución Automática:** Dada la naturaleza interconectada del sistema, se codificó un script automatizado local en Node.js, conectado a las llaves administrativas de `firebase-admin`. El script escaneó e iteró a través de todos los usuarios.
- **Resultados de la Purga:** Se extirparon fulminantemente 27 documentos de la colección de Firestore (`usuarios`/`users`) y 6 cuentas residuales activas de los registros del servidor cerrado de Firebase Authentication.
- **Protección Garantizada:** El script protegió expresamente el UID asociado a la cuenta principal del sistema (`uzielisaac28@gmail.com`) y mantuvo completamente intactas las entidades de configuración académica (`carreras`, `materias` y `grupos`). 

---
*Fin del registro de esta actualización.*

---

## 🔐 Rediseño del Flujo de Autenticación y Correcciones de Registro (Marzo 2026)

### 1. Unificación Estética del Acceso
- **Shared Branding:** Se implementó una cabecera de marca idéntica para `LoginPage` y `RegisterPage`, situando el logo oficial de Byfrost® por fuera de la tarjeta de login para una transición visual simétrica.
- **Navegación por Tabs:** Se sustituyeron los enlaces de texto inferiores por un selector de pestañas (`Login | Registrarse`) integrado en la parte superior de la tarjeta principal, mejorando la usabilidad y la percepción de "aplicación única".

### 2. Optimización del Flujo de Registro
- **Navegación Proactiva:** Se eliminó el bug del "Doble Clic". Ahora la aplicación detecta el éxito del registro y redirige al usuario forzosamente a su área de trabajo (Dashboard, Projects o Admin) de manera inmediata mediante `useNavigate`.
- **Blindaje de Errores:** Se corrigieron excepciones por importaciones faltantes (`ArrowLeft`) y errores de desestructuración en el hook `useAuth`, garantizando que la sincronización con el Backend de C# ocurra sin interrupciones tras la creación de la cuenta en Firebase.
- **Mensajería Adaptativa:** Se actualizaron las validaciones y avisos de error para guiar al usuario a través del nuevo sistema de pestañas ante credenciales inválidas.

---

## 🏙️ Fondo 3D Skyscraper 4K y Persistencia de Auth (Marzo 2026)

### 1. Integración de Modelo High-End (4K)
- **Impacto Visual Premium:** Se sustituyó el modelo 3D básico por una versión de alta resolución (`modern_office_building_4k.glb` de 78MB). Este cambio eleva la percepción de calidad de la plataforma, dotándola de una estética corporativa moderna y detallada.
- **Renderizado Optimizado:** Se recalcularon los valores de iluminación y materiales para que el edificio luzca nítido tanto en modo claro como oscuro, manteniendo la estabilidad del framerate.

### 2. Persistencia de Interfaz (`AuthLayout.jsx`)
- **Navegación sin Parpadeos:** Se implementó un `AuthLayout` envolvente para las rutas de `/login` y `/register`. Esto permite que el componente `CityBackground` se mantenga vivo durante la navegación entre pestañas, evitando que el modelo 3D se descargue y vuelva a cargar, lo cual antes causaba desapariciones momentáneas del fondo.
- **Estado Compartido:** El layout detecta proactivamente en qué página se encuentra el usuario y sincroniza la configuración del fondo 3D en milisegundos.

### 3. Animación de Cámara y Perspectiva Dinámica
- **Transiciones de "Vuelo":** Se desarrolló una lógica de animación suave que rota y desplaza el edificio dependiendo de si el usuario está iniciando sesión o registrándose. 
    - En **Login**, se muestra una vista más frontal y equilibrada.
    - En **Registro**, el edificio realiza un giro cinemático hacia una perspectiva lateral más profunda, guiando visualmente al usuario a través del cambio de contexto.
- **Calibración Final:** Mediante herramientas de ajuste en tiempo real (Leva), se fijaron las coordenadas definitivas (`posY: -3.1`, `baseRotY: -1.4`, `scale: 14.3`) para asegurar que la torre sea la protagonista visual detrás del formulario.

### 4. Refinamiento en Legibilidad (Contrastes UI)
- **Título Blindado:** El nombre oficial "Byfrost®" y sus subtítulos fueron reforzados con sombras de texto (`text-shadow`) y colores blancos sólidos fijos. Esto garantiza que el branding sea 100% legible sobre las texturas oscuras o claras del edificio 3D en cualquier resolución.
- **Degradados de Integración:** Se suavizaron los gradientes inferiores y laterales del fondo para que la base del edificio se funda orgánicamente con la Interfaz de Usuario, eliminando cortes bruscos.

---
*Fin del registro de esta actualización.*

---

## 🎨 Rediseño de Galería y Buscador "Thinking Bubble" (Marzo 2026)

### 1. Buscador Conceptual "Thinking Bubble"
- **Filosofía de Diseño:** Se transformó el buscador de una barra estática a un elemento interactivo que simula un "burbuja de pensamiento".
- **Estructura Estética:** Incluye dos puntos suspensivos externos ubicados a la izquierda de la esfera principal, creando un efecto visual de nube de ideas.
- **Micro-interacciones:** La esfera se expande suavemente hacia un campo de texto redondeado (`rounded-2xl`) mediante una animación `cubic-bezier`, optimizando el espacio y la limpieza visual.

### 2. Pulido de Sección "Colección"
- **Identidad de Filtros:** Se rediseñó la cabecera de la sección de filtros, otorgándole a la etiqueta "Colección" un fondo propio y un icono de filtro enmarcado, mejorando la jerarquía visual de la página.

---
*Fin del registro de esta actualización.*
