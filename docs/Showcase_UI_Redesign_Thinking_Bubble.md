# 🎨 Rediseño de Galería y Buscador "Thinking Bubble" (Marzo 2026)

Este documento detalla la evolución visual y funcional de la página de Galería de Proyectos (`ShowcasePage.jsx`), introduciendo conceptos de diseño interactivo y micro-animaciones premium.

## 1. Buscador Conceptal "Thinking Bubble"
Se ha reemplazado el buscador convencional por una interfaz interactiva basada en una "filosofía de pensamiento".

### Características Técnicas:
- **Efecto de Burbuja de Pensamiento:** Se implementó una estructura donde dos puntos suspensivos (esferas de material idéntico a la principal pero de menor tamaño) se sitúan a la izquierda de la esfera de búsqueda, simulando el icono universal de "pensando" o "escribiendo".
- **Esfera Principal Inmersiva:** La lupa de búsqueda (`Search`) ocupa el protagonismo central dentro de una esfera de `w-14 h-14`. El icono ha sido escalado para garantizar un centrado visual perfecto.
- **Expansión Orgánica:** Al hacer clic, los puntos desaparecen mediante un fundido mientras la esfera se expande horizontalmente transformándose en un campo de texto con bordes redondeados (`rounded-2xl`).
- **Animaciones:** Se utilizó una curva de tiempo `cubic-bezier(0.23, 1, 0.32, 1)` para lograr una expansión fluida y de alta gama.

## 2. Rediseño de la Sección "Colección"
Se mejoró la jerarquía visual de los filtros superiores para aportar un aire más profesional y ordenado.

### Características:
- **Badge de Colección:** La etiqueta "Colección" ahora reside dentro de un contenedor dedicado con fondo sutil (`bg-gray-50`) y bordes suavizados.
- **Iconografía Dedicada:** Se incluyó un icono de filtro (`Filter`) encerrado en su propio marco blanco/oscuro, mejorando la legibilidad y el equilibrio estético con los botones de "Stacks" adyacentes.
- **Peso Tipográfico:** Se ajustó el texto a `font-bold` con espaciado (`tracking-tight`) para diferenciarlo claramente de las opciones de filtrado.

## 3. Adaptabilidad y Modo Oscuro
- Todos los componentes fueron probados bajo el esquema de colores institucional (`#1a1d27` para fondos de contenedores y `#0f1117` para el fondo principal).
- Se garantizó que el buscador, al estar vacío y perder el foco (`onBlur`), regrese elegantemente a su estado de "burbuja" inicial.

---
*Documentación generada tras la implementación del rediseño interactivo de Marzo 2026.*
