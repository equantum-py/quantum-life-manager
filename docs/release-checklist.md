# Checklist de Release: Fase de Estabilización

## Estado de Desarrollo
- **TG-8 Telegram Assistant 24/7:** Funcional y cerrado.

## Rutas y Componentes Verificados
- [x] `/login`: Carga correctamente, mock/supabase mode ok.
- [x] `/dashboard`: Carga datos sin romper.
- [x] `/tasks`: Renderiza correctamente, no arroja "Invalid time value", parseo robusto.
- [x] `/agenda`: Fechas seguras operativas.
- [x] `/alerts`: Operativo.
- [x] `/sections`: Listado de secciones seguro por permisos.
- [x] `/notes`: Operativo.
- [x] `/settings`: Ajustes de entorno (Mock/Supabase).
- [x] `/whatsapp-test`: Simulador sin afectación por el panel Telegram.
- [x] `/telegram`: Panel robusto de auditoría solo-lectura, con filtros y visualización clara. No rompe con payloads malformados (`safeStr`).

## Permisos
- [x] RLS intactos.
- [x] Validación de roles en Front-End para `/telegram` (acceso exclusivo `admin`).

## Integración Telegram & Supabase (Asistente 24/7)
- [x] El bot guarda notas directamente en `public.notes`.
- [x] El bot agenda reuniones directamente en `public.meetings`.
- [x] Se crean tareas reales en `public.tasks`.
- [x] Soporte Multi-turno (`needs_section`) con **auto-guardado automático** al recibir la sección. Ya no pide CREAR en este punto.
- [x] Títulos de reuniones se normalizan y capitalizan (ej. "Reunión con Bristol").
- [x] Reenvíos del propio bot se bloquean.
- [x] Se soportan consultas como "Qué tengo para hoy?".
- [x] Fallback a `CREAR`/`CANCELAR` solo para intenciones ambiguas.

## PWA
- [x] Configuración básica: `index.html` cuenta con meta tags nativos para iOS/Android y viewport config de safe areas.
- [x] `manifest.json` inicial creado en carpeta `public` y actualizado con propiedades standalone, orientaciones y colores.
- [x] Iconos presentes (`192`, `512`, `maskable`, `apple-touch-icon`).
- [x] Theme color configurado en `#ffffff`.
- [x] App instalable y usable como app nativa.
- [x] Mobile safe areas verificados en layout y componentes.
- [x] Rutas principales operativas sin afectar el shell de la PWA.

## Pendientes Conocidos (Futuro)
- Conectar IA real (OpenAI/Gemini) para mejorar la detección avanzada de lenguaje natural.
- Funciones de borrado, edición o confirmación en `/telegram` deshabilitadas en esta fase visual.

## Pasos para probar en Producción
1. Desplegar Front-End.
2. Comprobar inicio de sesión.
3. Verificar que `/telegram` es accesible para un admin.
4. Mandar un mensaje desde Telegram y observar el flujo de log y clasificación en el panel en vivo.
