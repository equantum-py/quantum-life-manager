# Documentación de Tarea Programada: Cron de Recordatorios

## 1. Objetivo
Este documento registra el funcionamiento del trabajo automático (Cron Job) que se encarga de despachar notificaciones push a los usuarios cuando llega la fecha y hora de sus recordatorios pendientes.

## 2. Nombre del Cron Activo
El trabajo programado en la base de datos de producción (Supabase `pg_cron`) se llama:
**`process-reminders-every-minute`**

## 3. Frecuencia de Ejecución
El cron job está configurado para correr **cada 1 minuto** (`* * * * *`).

## 4. Flujo Automático
1. El cron hace una petición HTTP POST segura a la Edge Function `process-reminders`.
2. La función busca todos los registros en `public.reminders` que tengan `status = 'pending'` y `remind_at <= now()`.
3. Procesa hasta 20 recordatorios por ciclo (para no saturar la red ni la memoria de la función).
4. Localiza las suscripciones de los dispositivos activos asociados al creador del recordatorio.
5. Envía la notificación nativa cifrada vía Web Push.
6. Actualiza el recordatorio a `status = 'sent'` y registra el `sent_at` real. (En caso de fallar, pasa a `failed`).
7. Limpia automáticamente las suscripciones expiradas (`is_active = false`) si el proveedor (Google/Apple) responde con error 404/410.

## 5. Estado de Validación (PUSH-5)
✅ **Cron automático validado en producción con notificación real recibida en dispositivo móvil.**
El sistema funciona de forma desatendida las 24 horas. Los usuarios reciben los avisos en sus teléfonos incluso si tienen la PWA cerrada.
