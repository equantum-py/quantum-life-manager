# Documentación de Edge Function: `send-push-notification`

## 1. Objetivo
Esta función (Edge Function de Supabase) es responsable de enviar Notificaciones Push (Web Push API) de manera segura a los dispositivos registrados de un usuario.

## 2. Variables de Entorno (Secrets) Requeridas
Para que la función opere correctamente, debes guardar en **Supabase Secrets**:
- `VAPID_PUBLIC_KEY`: Tu clave VAPID pública.
- `VAPID_PRIVATE_KEY`: Tu clave VAPID privada.
- `VAPID_SUBJECT`: `mailto:tu-email@ejemplo.com` (o la URL de tu proyecto).

*(NOTA: `VITE_VAPID_PUBLIC_KEY` solo vive en Vercel/Frontend, pero la función también necesita la pública internamente para construir los headers de encriptación).*

Para setear las variables vía CLI:
```bash
supabase secrets set VAPID_PUBLIC_KEY="tu-clave-publica"
supabase secrets set VAPID_PRIVATE_KEY="tu-clave-privada"
supabase secrets set VAPID_SUBJECT="mailto:contacto@tuapp.com"
```

## 3. Despliegue (Deploy)
Si tienes el CLI instalado localmente:
```bash
supabase functions deploy send-push-notification --project-ref <tu-project-ref> --use-api
```
O de lo contrario, haz un commit y deja que el GitHub Actions lo despliegue.

## 4. Cómo probarla manualmente (Prueba Unitaria)
Una vez desplegada y con las VAPID configuradas, puedes disparar una alerta de prueba desde tu consola (Powershell/Bash) o usando Postman.

**Ejemplo cURL:**
```bash
curl -i --location --request POST 'https://<tu-project-ref>.supabase.co/functions/v1/send-push-notification' \
--header 'Authorization: Bearer <TU_ANON_KEY_O_SERVICE_ROLE_KEY>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "user_id": "<TU_USER_ID_AQUÍ>",
  "title": "Prueba de Integración Push",
  "body": "¡Las notificaciones están funcionando perfectamente!",
  "url": "/alerts"
}'
```
*(Reemplaza `<TU_USER_ID_AQUÍ>` con tu ID que está en la tabla `push_subscriptions`).*

## 5. Qué revisar si algo falla
- **Teléfono/Navegador:** Asegúrate de que no estás en "No molestar" (Do Not Disturb) y tienes permisos de notificaciones habilitados a nivel de Sistema Operativo para ese navegador.
- **Respuesta de la Función:** La función devuelve un JSON del estilo `{"message":"Push process completed","sent":1,"failed":0,"disabled":0}`. Si `failed` es 1 y `disabled` es 1, significa que el token expiró (código HTTP 410) y Supabase lo marcó como inactivo. Debes desactivar y reactivar desde Ajustes en la app.
- **Logs:** Revisa la pestaña Edge Functions > Logs en tu panel de Supabase. Nunca logueamos las claves VAPID allí por seguridad.

## 6. Estado de Validación
✅ **Push manual real validado en dispositivo móvil.** La función envía las cargas cifradas correctamente a través de los servidores PUSH de los navegadores, y la PWA despierta en background para mostrar la notificación.
