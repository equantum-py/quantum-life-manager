# Auditoría UX/UI (Estado Actual)

## Diagnóstico General
Actualmente, Quantum Life Manager tiene una funcionalidad sólida y estable gracias a la integración con Supabase y el Asistente de Telegram. Sin embargo, a nivel visual y de experiencia de usuario, se percibe como un **panel de administración web (Admin Dashboard)** adaptado a celular, en lugar de una **App Móvil Premium** instalada.

La interfaz actual utiliza Tailwind CSS con un fondo con gradientes básicos y componentes estándar. Aunque es responsiva, la experiencia en dispositivos móviles carece de la fluidez, los espaciados, y los micro-detalles que diferencian una web de una app tipo iOS.

## Referencias mobile usadas como inspiración
- **Estilo:** Apps móviles nativas, ecommerce moderno, estilo iOS/PWA.
- **Aclaración:** No se copian colores, no se copian marcas ni imágenes de las referencias. Se mantiene la paleta Quantum (azul principal, celeste acento, fondo claro, cards blancas, sombras suaves, bordes redondeados y glassmorphism suave). Solo se toma como referencia la experiencia mobile, estructura limpia, espaciado, jerarquía visual fuerte, tarjetas (cards) grandes y navegación inferior fija (bottom nav).

## Problemas Visuales y de Layout Actuales
- **Identidad Premium:** Falta un sistema de diseño cohesionado. Los componentes lucen genéricos (tipo panel web), los botones a veces son muy chicos, y hay poco uso del espacio en blanco.
- **Tipografía y Jerarquía:** Faltan títulos grandes y claros. La jerarquía visual debe ser más fuerte para guiar la lectura rápidamente.
- **Componentes (Cards y Botones):** En lugar de tablas o tarjetas angostas, faltan "cards grandes redondeadas". Los filtros actuales son combos web en lugar de buscadores o filtros tipo píldoras amigables.
- **Navegación:** En móvil, la app todavía depende en parte del paradigma de escritorio. Se requiere priorizar una navegación inferior (bottom nav) fija, tipo app, con iconos grandes, labels cortos y fondo glass/blur.

## Rutas Críticas Analizadas
- `/login`: Actualmente luce web. Necesita un diseño limpio tipo app (logo centrado, título claro tipo "Bienvenido a Quantum", inputs grandes redondeados, botón principal ancho, link secundario simple, mucho aire vertical y sin sidebar/elementos de dashboard).
- `/dashboard`: Requiere abandonar el estilo "tabla". Faltan títulos grandes tipo "Hola, Derlis", subtítulo corto (fecha/resumen), y cards grandes que sirvan como módulos (Hoy, Tareas, Agenda, Telegram, Secciones) con accesos rápidos.
- `/tasks`, `/agenda`, `/notes`: Las listas actuales se sienten administrativas. Requieren diseño por "cards grandes", filtros horizontales tipo píldoras, acciones rápidas visibles (evitar botones chicos) y badges sutiles (ej. tipo "Reunión").
- `/telegram`: Es funcional, pero se lee como una tabla admin. Los logs deberían mostrarse como cards compactas, con filtros tipo píldora, acciones visualmente claras y las métricas en un resumen superior.

## Quick Wins & Riesgos
- **Safe Areas:** Aplicar un envoltorio universal (wrapper) que respete estrictamente el notch y la barra de navegación del sistema operativo (bottom nav fija).
- **Riesgo:** Modificar componentes de React puede romper la lógica estable; los cambios deben enfocarse puramente en CSS/Tailwind (clases) manteniendo intactos los estados (`useState`, `props`, `onClick`).
