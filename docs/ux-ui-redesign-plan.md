# Plan de Rediseño: FASE UX/UI + MOBILE APP EXPERIENCE + PWA FINAL

Este plan detalla las etapas de ejecución para la transformación visual de Quantum Life Manager para que deje de sentirse como un panel web y pase a ser una **app móvil real, moderna y premium**. Durante estas fases **no se alterará la lógica estable, ni el Asistente de Telegram, ni las funciones Edge.**

## Referencias mobile usadas como inspiración
- **Aclaración:** No se copian colores. No se copian marcas. Se toma como referencia la experiencia mobile, jerarquía, cards, bottom nav y espaciado de apps tipo ecommerce moderno o iOS.

## Etapas del Rediseño

### ~~UX-1: Sistema Visual Base~~ (COMPLETADO)
El objetivo es establecer los cimientos (estilo iOS/PWA) antes de modificar vistas complejas.
- **Estilo Visual:** Mantener paleta Quantum (azul principal, celeste acento, fondo claro, cards blancas, sombras suaves, bordes redondeados y glassmorphism suave).
- **Tipografía y Jerarquía:** Títulos grandes, mucho espacio blanco (aire visual), y jerarquía visual fuerte.
- **Formas y Componentes:** Bordes muy redondeados (border-radius alto), inputs grandes y cómodos, botones anchos, evitar botones muy chicos. Implementar filtros horizontales tipo píldoras.

### ~~UX-2: Mobile App Layout~~ (COMPLETADO)
Reestructurar la envoltura de la aplicación para garantizar comportamiento nativo.
- **Navegación Inferior (Mobile):** Fija tipo app, iconos grandes, labels cortos, estado activo muy claro, fondo glass/blur suave, safe area bottom.
- **General Layout:** En desktop puede seguir existiendo el sidebar, pero en móvil debe ocultarse y priorizar el bottom nav.
- **Padding y Estructura:** El contenido debe tener padding cómodo. No usar cards angostas como panel, usar max-width mobile cuando corresponda. Evitar que parezca una web comprimida.

### ~~UX-3: Login y Dashboard Premium~~ (COMPLETADO)
- **Login Mobile:** Logo centrado arriba, título claro ("Bienvenido a Quantum"), inputs grandes redondeados, botón principal ancho, link secundario simple, mucho aire. Sin sidebar ni dashboard. Diseño pensado para instalar.
- **Dashboard Mobile:** Título grande arriba ("Hola, Derlis"), subtítulo corto (fecha/resumen del día). Cards grandes tipo módulos (Hoy, Tareas, Agenda, Telegram, Secciones) con accesos rápidos redondeados. Menos tablas, más cards.

### ~~UX-4: Tareas, Agenda y Notas~~ (COMPLETADO)
Rediseñar las listas para que no sean tablas admin.
- **Tareas:** Filtros horizontales tipo píldoras. Cards grandes (sección, título, fecha/hora, prioridad, acción principal). Acciones rápidas visibles. Estados claros pero limpios.
- **Agenda:** Timeline o cards grandes por evento. Fecha/hora visible, título natural, badge pequeño de tipo "Reunión". Border radius amplio y mejor separación entre eventos.
- **Notas:** Buscador tipo píldora arriba, filtro por sección, cards simples y limpias (título fuerte, contenido secundario, botones discretos).

### UX-5: Telegram Panel
Refinar el panel de auditoría para uso tipo app.
- **Auditoría Visual:** No hacerlo tipo tabla admin. Usar cards de auditoría.
- **Resumen:** Resumen superior con métricas.
- **Filtros y Logs:** Filtros tipo píldora y logs presentados como cards compactas.
- **Acciones:** Acciones pendientes/confirmadas muy visuales.

### UX-6: PWA Final
Cerrar la brecha tecnológica para ser una App Instalable completa.
- **Iconos Reales:** Generar y asociar todos los tamaños de iconos.
- **Splash Screen y App Install:** Arranque nativo y prompt de instalación.
- **Manifest Completo:** Refinar theme-color y configuración standalone.
