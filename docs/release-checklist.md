# Checklist de Release: Fase de Estabilización

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
- [x] El bot responde a comandos de confirmación (`CREAR`, `CANCELAR`).
- [x] Reenvíos del propio bot se bloquean mediante función `isBotMessage()`.
- [x] Se crean tareas reales en `public.tasks`.
- [x] Se crean reuniones reales en `public.meetings`.
- [x] Se crean notas reales en `public.notes`.
- [x] Se soportan consultas como "Qué tengo para hoy?".
- [x] Soporte Multi-turno (`needs_section`) cuando el bot no detecta el área de trabajo.

## PWA
- [x] Configuración básica: `index.html` cuenta con meta tags.
- [x] `manifest.json` inicial creado en carpeta `public`.

## Pendientes Conocidos
- La IA real (OpenAI/Gemini) no está conectada por decisión de diseño actual.
- Funciones de borrado, edición o confirmación en `/telegram` deshabilitadas.
- Iconografía oficial PWA (PNGs variados en manifest) pendiente para fase UX/UI.

## Pasos para probar en Producción
1. Desplegar Front-End.
2. Comprobar inicio de sesión.
3. Verificar que `/telegram` es accesible para un admin.
4. Mandar un mensaje desde Telegram y observar el flujo de log y clasificación en el panel en vivo.
