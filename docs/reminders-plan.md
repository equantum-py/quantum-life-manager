# Plan de Arquitectura: Recordatorios Internos (REM-1)

## 1. Objetivo
Preparar la infraestructura técnica y visual para soportar recordatorios programables (alertas proactivas) de Tareas y Reuniones en Quantum Life Manager, preparándolo para el futuro envío de notificaciones push (PWA), mensajes directos por Telegram, y avisos in-app.

## 2. Flujo Técnico Futuro
1. **Creación:** El usuario (o el Asistente Telegram) crea una tarea o reunión e indica que quiere un recordatorio (ej. "15 minutos antes" o "mañana a las 8").
2. **Persistencia:** Se inserta el registro principal (en `tasks` o `meetings`) y simultáneamente se crea un registro en la tabla `reminders` vinculando el ID de la tarea/reunión.
3. **Cron Job / Trigger:** Una Edge Function programada mediante `pg_cron` (o un cron externo) se ejecuta periódicamente buscando recordatorios en estado `pending` donde `remind_at <= NOW()`.
4. **Envío:** El sistema despacha la notificación a través de los canales configurados (Push, Telegram, App).
5. **Cierre:** El recordatorio se marca como `sent` y se registra el `sent_at`.

## 3. Tipos de Recordatorio
- **Relativos:** "X minutos/horas antes del vencimiento".
- **Absolutos:** "El día Y a la hora Z".

## 4. Relaciones de Datos
Se ha decidido utilizar una **tabla polimórfica separada** (`reminders`) en lugar de sobrecargar las tablas `tasks` y `meetings` con múltiples columnas de recordatorios. 
- `source_type`: Define de qué tabla viene (`task`, `meeting`, `custom`).
- `source_id`: El UUID del registro original.

Esta decisión permite tener **múltiples recordatorios** por tarea/reunión en el futuro sin romper el esquema.

## 5. Canales de Notificación (Futuro)
- **App (In-App Alerts):** Visualizadas en la pestaña `/alerts`.
- **Telegram:** Mensajes proactivos del bot al chat del usuario.
- **Push:** Notificaciones nativas del SO a través de Service Workers en la PWA.

## 6. Riesgos
- **Timezones:** Es crítico asegurar que `remind_at` se guarde siempre en UTC y se evalúe correctamente contra el cron job.
- **Spam:** Enviar el mismo recordatorio múltiples veces si la Edge Function falla a mitad de proceso. El status debe bloquearse (`processing`) antes de enviar.
- **Privacidad:** Exponer detalles de tareas en notificaciones push en pantallas bloqueadas.

## 7. Checklist de Implementación (Fase REM-1)
- [x] Arquitectura de BD diseñada (`supabase/reminders_schema.sql`).
- [x] UI de Settings preparada.
- [x] UI de Alerts adaptada para estado de "Recordatorios".
- [ ] (Siguiente Fase) Habilitar RLS en tabla de recordatorios.
- [ ] (Siguiente Fase) Integrar Service Workers (PWA) para Push.
- [ ] (Siguiente Fase) Modificar el bot de Telegram para entender intenciones de recordatorio.
