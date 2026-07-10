# Roadmap Quantum Life Manager v1.1

## Estado Actual (v1)
Quantum Life Manager v1 ha alcanzado la madurez funcional. Cuenta con un sistema sólido de Autenticación, Tareas, Reuniones, Notas, y un potente **Asistente Telegram (TG-9)** capaz de procesar mensajes de texto y notas de voz (vía OpenAI Whisper). La PWA está instalable y configurada con una interfaz gráfica mobile-first altamente pulida.

## Objetivo de v1.1
La versión 1.1 tiene como misión transformar la aplicación de un "gestor pasivo" a un **"asistente proactivo"**. La app debe notificar autónomamente al usuario sobre sus compromisos y mantener sincronizados calendarios de terceros para una productividad sin fricción.

## Módulos Planificados
La planificación técnica de los siguientes módulos ya fue completada (fases 1):
1. **Recordatorios Internos (REM-1):** Infraestructura de cron-jobs y tablas de base de datos preparadas.
2. **Push Notifications PWA (PUSH-1):** Planificación de Web Push API, Service Workers y VAPID keys.
3. **Google Calendar (CAL-1):** Diseño de integración bidireccional vía OAuth 2.0 y Google Cloud.

---

## Orden Recomendado de Implementación Real
Para evitar colisiones técnicas o problemas de estado, se sugiere ejecutar el código real en las siguientes sub-fases:

### Módulo: Recordatorios
1. **REM-2:** Ejecutar de forma segura el esquema SQL propuesto (`supabase/reminders_schema.sql`).
2. **REM-3:** Modificar el backend para inyectar recordatorios automáticos al crear tareas/reuniones desde Telegram y la App.

### Módulo: Notificaciones Push
3. **PUSH-2:** Generar claves VAPID y escribir/registrar el Service Worker (`sw.js`).
4. **PUSH-3:** Implementar el pop-up de permisos y guardar la suscripción del teléfono tras ejecutar el esquema SQL (`supabase/push_notifications_schema.sql`).
5. **PUSH-4:** Programar la Edge Function para que, leyendo la tabla `reminders`, despache notificaciones Push nativas.

### Módulo: Google Calendar
6. **CAL-2:** Configurar la app en Google Cloud Console para crear credenciales OAuth.
7. **CAL-3:** Implementar las Edge Functions de conexión (`google-calendar-auth-start`, `callback`) encriptando los tokens de manera segura.
8. **CAL-4:** Adaptar el Webhook de Telegram para que envíe un espejo del evento a Google Calendar si la conexión está activa.

---

## SQL Pendientes de Ejecutar (Manualmente)
- `supabase/reminders_schema.sql` (Revisar RLS antes de correr).
- `supabase/push_notifications_schema.sql` (Revisar RLS antes de correr).
- `supabase/google_calendar_schema.sql` (Requiere sistema de encriptación o Supabase Vault).

## Variables Necesarias en el Entorno
- **Google Calendar:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- **Push:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Riesgos Técnicos y Checklist de Seguridad
- [ ] **NO ejecutar SQL sin revisión:** Confirmar primero las reglas Row Level Security (RLS) en entornos de producción.
- [ ] **NO activar Push sin VAPID keys:** Generaría fallos silenciosos en la promesa de Service Worker.
- [ ] **NO activar Google Calendar sin encriptación:** Guardar `refresh_tokens` en texto plano es una vulnerabilidad crítica; documentar o implementar Supabase Vault.
