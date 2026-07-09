# Próxima Fase: Rediseño UX/UI & PWA

El código base se encuentra estable y funcional, con todos los conductos de datos operando de manera predecible. La siguiente fase se enfoca exclusivamente en la presentación visual, la usabilidad y la experiencia App nativa.

## 1. Rediseño Mobile-First
- Eliminar el aspecto "web dashboard genérico".
- Transicionar hacia una interfaz táctil, priorizando los "pulgares".
- Implementar animaciones de transición fluidas (frameshift, slide, fade).
- Ocultar scrollbars por defecto.

## 2. Navegación Estilo App
- La barra de navegación inferior (`MobileBottomNav`) será el ancla de navegación.
- Implementar Header fijo e inmersivo con acciones contextuales (ej. botón crear en la esquina, avatares, notificaciones integradas).
- Soporte completo para navegación por gestos en iOS (swipe back).

## 3. Mejoras del Dashboard & Cards
- En lugar de largas listas o tablas, utilizar tarjetas de alto contraste con bordes suavizados (glassmorphism o solid soft shadow).
- Resaltar información clave con tipografía grande (Google Fonts como Inter o Outfit).
- Micro-interacciones al hacer tap o hover.

## 4. Mejoras en Agenda y Panel Telegram
- Agenda visual con formato tipo calendario scrollable en lugar de listas rígidas. Deberá hidratarse visualizando tanto `tasks` como las nuevas `meetings`.
- Rediseño de las Cards de Telegram para parecerse más a notificaciones de chat.
- Inclusión de avatares automáticos (initials o colores hash basados en el username del sender).
- Mostrar secciones visuales dedicadas a "Notas" en el Dashboard principal dado que Telegram ya permite guardarlas.

## 5. Aplicación Web Progresiva (PWA)
- Pulir `public/manifest.json` con todos los iconos requeridos (192x192, 512x512, máscaras).
- Habilitar registro del Service Worker en `main.tsx` o index para capacidades offline-first básicas y velocidad en caché.
- Splash screen nativo para Android e iOS.
- Manejar `theme-color` reactivamente para integrarse con modo oscuro.

## 6. Branding e Íconos
- Renovar paleta de colores. Evitar colores primarios puros, en favor de paletas modernas (ej. Tailwind extendidas, oscuros elegantes).
- Logo de Quantum pulido.
- Reemplazar íconos predeterminados por versiones personalizadas o asegurar consistencia total en Stroke/Grosor de Lucide Icons.
