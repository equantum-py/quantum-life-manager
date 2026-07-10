# Plan de Arquitectura: Notificaciones Push PWA (PUSH-1)

## 1. Objetivo
Preparar la base técnica para enviar notificaciones push nativas al dispositivo móvil del usuario (vía Service Worker) sin necesidad de tener la PWA abierta en primer plano. Las notificaciones avisarán sobre tareas vencidas, reuniones inminentes y mensajes importantes del Asistente Telegram.

## 2. Flujo Técnico Esperado
1. **Suscripción (Frontend):** La app solicitará permiso mediante `Notification.requestPermission()`. Si el usuario acepta, el Service Worker generará un endpoint de suscripción usando la `VAPID_PUBLIC_KEY`.
2. **Registro (Backend):** La suscripción (endpoint, keys) se enviará a Supabase y se guardará en la tabla `push_subscriptions` vinculada al `user_id`.
3. **Disparador:** La infraestructura de recordatorios (REM-1) o el Webhook de Telegram detectan que hay un aviso pendiente de ser despachado.
4. **Envío:** Una Edge Function (`send-push-notification`) busca las suscripciones activas del usuario y usa el protocolo Web Push (con la `VAPID_PRIVATE_KEY`) para mandar la carga útil (title, body, icon).
5. **Recepción:** El Service Worker en el teléfono recibe el evento `push`, despierta y muestra la notificación al usuario.

## 3. Requisitos del Navegador
- PWA instalable o Safari/Chrome con soporte para **Web Push API**.
- Conexión HTTPS.
- Service Worker registrado (actualmente no existe, se implementará en PUSH-2).

## 4. Relación con Otros Sistemas
- **REM-1:** Será la principal fuente de disparo. El flujo será: `reminders.status = pending` -> `remind_at <= now()` -> Edge Function cron -> `send-push-notification` -> Push enviada.
- **Telegram:** El bot puede enviar alertas inmediatas de confirmación a través de la misma función sin esperar un cron.

## 5. Variables de Entorno Necesarias
Para firmar las notificaciones push (VAPID):
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (mailto o URL de contacto)
*(Nunca hardcodear las claves privadas en el repositorio. Usar Supabase Secrets).*

## 6. Riesgos
- **Permisos Bloqueados:** Los usuarios que niegan el permiso en el primer intento no pueden volver a ser interrogados por JS. Requiere UI educativa antes del prompt.
- **Caducidad de Endpoints:** Los navegadores rotan o expiran las URLs de suscripción. El backend debe atrapar errores `410 Gone` y desactivar/eliminar la fila en la BD para evitar envíos basura.
- **Soporte iOS:** En iOS (Safari) el Push PWA solo funciona si la app está explícitamente instalada en la pantalla de inicio (Añadir a inicio).

## 7. Checklist de Implementación (Fase PUSH-1)
- [x] Esquema SQL de Push Subscriptions preparado.
- [x] UI visual (Informativa) inyectada en Settings y Alerts.
- [ ] (Siguiente Fase PUSH-2) Generar VAPID Keys e inyectarlas en Supabase.
- [ ] (Siguiente Fase PUSH-2) Escribir y registrar el Service Worker (`sw.js`).
- [ ] (Siguiente Fase PUSH-2) Solicitar permisos reales y guardar en tabla.
- [ ] (Siguiente Fase PUSH-2) Desplegar Edge Function `send-push-notification`.
