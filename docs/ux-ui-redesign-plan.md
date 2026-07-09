# Plan de Rediseño: FASE UX/UI + MOBILE APP EXPERIENCE + PWA FINAL

Este plan detalla las etapas de ejecución para la transformación visual de Quantum Life Manager en una experiencia móvil premium, rápida y cómoda. Durante estas fases **no se alterará la lógica estable, ni el Asistente de Telegram, ni las funciones Edge.**

## Etapas del Rediseño

### UX-1: Sistema Visual Base
El objetivo es establecer los cimientos del nuevo diseño antes de tocar cualquier componente de lógica compleja.
- **Colores:** Definir una paleta de colores sofisticada (fondos, primarios, acentos y textos) que transmita alta gama.
- **Tipografía:** Ajustar pesos, alturas de línea y tamaños para jerarquizar correctamente la lectura en pantallas pequeñas.
- **Formas y Sombras:** Estandarizar bordes amplios (`radius`), sombras modernas y efectos sutiles como glassmorphism.
- **Componentes Atómicos:** Refactorizar visualmente botones, inputs, badges y tarjetas base sin romper sus `props` u `onClick`.

### UX-2: Mobile App Layout
Reestructurar la envoltura principal de la aplicación (`AppLayout`, `Header`, `MobileBottomNav`) para garantizar comportamiento nativo.
- **Safe Areas:** Implementar paddings que respeten el notch y las barras de navegación de iOS/Android de forma perfecta.
- **Navegación Inferior:** Mejorar los iconos, añadir estados activos vibrantes y un diseño flotante o anclado sofisticado.
- **Header Mobile:** Rediseñar la barra superior para que sea minimalista.
- **Layout Standalone:** Configurar contenedores para evitar el overscroll elástico indeseado del navegador y garantizar scroll interno.

### UX-3: Dashboard Premium
Transformar la página de inicio en un centro de comando verdadero.
- **Resumen Diario (Day-at-a-glance):** Diseño enfocado en "lo que necesitas saber hoy" de un vistazo.
- **Accesos Rápidos:** Accesos visualmente atractivos para crear o navegar.
- **Próximas Tareas y Reuniones:** Presentación en formato horizontal (scrollable) o widgets que consuman poco espacio vertical pero aporten valor inmediato.
- **Alertas:** Notificaciones y alertas más integradas al sistema visual.

### UX-4: Tareas, Agenda y Notas
Rediseñar las vistas de lista y creación de contenido.
- **Tarjetas Modernas (Cards):** Cada tarea/reunión/nota debe sentirse como una entidad manipulable, con jerarquía visual (prioridades, colores de sección).
- **Filtros Claros:** Implementar chips de filtrado rápidos (scroll horizontal) en lugar de combos aburridos.
- **Acciones Rápidas:** Botones claros para cambiar de estado (completar, reprogramar) con hit-areas aptas para dedos.
- **Estados Visuales:** "Empty states" (pantallas vacías) y "Loading states" (esqueletos) bonitos y acogedores.

### UX-5: Telegram Panel
Refinar el panel de auditoría (exclusivo admin).
- **Auditoría Visual:** Reorganizar la tabla o lista de eventos para que se lea mejor.
- **Logs Claros:** Diferenciar entre mensajes del usuario, respuestas de IA (mock) y clasificaciones.
- **Acciones Pendientes:** Tarjetas distintivas para ver qué está esperando confirmación o sección.

### UX-6: PWA Final
Cerrar la brecha tecnológica para ser una App Instalable completa.
- **Iconos Reales:** Generar y asociar todos los tamaños de iconos (Apple Touch Icon, Android).
- **Splash Screen:** Asegurar un arranque nativo (pantalla de carga de SO).
- **App Install:** Habilitar el prompt de instalación si aplica.
- **Manifest Completo:** Refinar colores, temas y configuraciones PWA finales.
