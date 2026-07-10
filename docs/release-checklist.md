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

## QA-2: Test Funcional Final (v1 Release)
- [x] **Build**: Compilación exitosa, código TypeScript libre de errores estructurales.
- [x] **Rutas**: Navegación fluida en `/login`, `/dashboard`, `/tasks`, `/agenda`, `/notes`, `/telegram`, `/alerts`, `/sections`, y `/settings`.
- [x] **Auth**: Inicio y cierre de sesión operativos; bloqueo nativo de rutas protegidas para no autenticados.
- [x] **Tareas**: Listado correcto, creación operativa y marcaje de estados.
- [x] **Agenda**: Eventos se renderizan sin problemas de fechas, creación operativa.
- [x] **Notas**: Listado y creación operativos, búsqueda funcionando.
- [x] **Telegram Assistant**: La simulación confirma que la lógica multi-turno (solicitud de sección y auto-creación final) está intacta. Las intenciones naturales de Tareas, Reuniones y Notas impactan en las tablas correctas sin ensuciar la app.
- [x] **PWA**: Instalación activa, iconos vinculados, shell nativa standalone operativa.
- [x] **Mobile Experience**: Navegación segura (sin scroll horizontal global, bottom nav sin solapamientos, safe areas perfectos).
- [x] **Desktop Experience**: Sidebar colapsado correctamente, grid espacioso funcional.

## Pendientes Conocidos (Futuro)
- Conectar IA real (OpenAI/Gemini) para mejorar la detección avanzada de lenguaje natural.
- Funciones de borrado, edición o confirmación en `/telegram` deshabilitadas en esta fase visual.

## Pasos para probar en Producción
1. Desplegar Front-End.
2. Comprobar inicio de sesión.
3. Verificar que `/telegram` es accesible para un admin.
4. Mandar un mensaje desde Telegram y observar el flujo de log y clasificación en el panel en vivo.

### Despliegue (Deploy) de Edge Function
El despliegue de la función `telegram-webhook` se realiza mediante **GitHub Actions** (`.github/workflows/deploy-supabase-function.yml`), el cual:
- Permite la ejecución manual (`workflow_dispatch`).
- Utiliza la CLI de Supabase en Ubuntu para publicar el código al entorno productivo.
- Requiere tener el secreto `SUPABASE_ACCESS_TOKEN` configurado en el repositorio de GitHub.
- Requiere tener el secreto `OPENAI_API_KEY` configurado internamente en Supabase Secrets (para la función de Whisper).

## Limpieza de datos de prueba pendiente/completada
- [ ] Auditoría SQL preparada (`cleanup_audit.sql`).
- [ ] Candidatos a borrar revisados visualmente.
- [ ] Backup/Export de tablas sensibles realizado en el dashboard.
- [ ] Limpieza ejecutada manualmente con `cleanup_test_data.sql`.
- [ ] Rutas front-end validadas tras la purga para evitar interfaces rotas.

## Próximamente (v1.1) - Fase de Planificación CERRADA
- [x] **Google Calendar (CAL-1):** Planificado y esquema SQL documentado.
- [x] **Recordatorios (REM-1):** Planificado y esquema SQL documentado.
- [x] **Recordatorios (REM-2):** Base de datos estructurada, RLS seguro y frontend preparado con fallback. (SQL requiere ejecución manual).
- [x] **Push Notifications (PUSH-1):** Plan documentado, SQL propuesto y UI en preparación.

*⚠️ Implementación real pendiente. Ver `docs/roadmap-v1.1.md` para el orden de ejecución.*
- [ ] No ejecutar SQL de v1.1 sin revisión estricta de RLS.
- [ ] No activar notificaciones push sin VAPID keys.
- [ ] No activar Google Calendar sin OAuth seguro (Vault/Encriptación).

