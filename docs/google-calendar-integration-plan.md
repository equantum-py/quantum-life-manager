# Plan de Integración: Google Calendar (CAL-1)

## 1. Objetivo
Conectar las reuniones (meetings) generadas automáticamente o manualmente en Quantum Life Manager con Google Calendar, permitiendo que el Asistente 24/7 (Telegram) funcione como un agente de agendamiento real con reflejo en la nube de Google.

## 2. Flujo Técnico Esperado
1. **Interacción:** El usuario envía un mensaje (texto/audio) por Telegram: *"Agendar reunión con Daniel mañana a las 10:00"*.
2. **Procesamiento:** El Webhook (Edge Function) interpreta el mensaje, clasifica y normaliza la intención (`create_meeting`).
3. **Persistencia Local:** Se inserta el registro en la tabla `public.meetings`.
4. **Sincronización:** Una Edge Function asíncrona (o dentro del mismo webhook, dependiendo de la latencia tolerable) evalúa si el usuario tiene una conexión activa a Google Calendar.
5. **API de Google:** Se dispara un request a la API de Google Calendar insertando el evento usando el token del usuario.
6. **Actualización:** El evento devuelve un `google_event_id` que se guarda en la tabla `meetings` junto con el estado de sincronización.
7. **Feedback:** Telegram responde: *"Listo señor, agendé la reunión en Quantum y en Google Calendar."*

## 3. Variables de Entorno Necesarias
Para configurar el cliente OAuth de Google, se necesitan las siguientes variables en el entorno (Edge Functions o entorno Frontend):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (ej: `https://[project].supabase.co/functions/v1/google-calendar-callback`)

*Nota: Estos valores JAMÁS deben hardcodearse en el código ni subirse a GitHub. Deben gestionarse en Supabase Secrets o Vercel Environment Variables.*

## 4. OAuth 2.0 y Scopes Mínimos
El usuario deberá pasar por un flujo de OAuth estándar. Los scopes estrictamente necesarios para esta fase son:
- `https://www.googleapis.com/auth/calendar.events` (Permite leer, crear y editar eventos del calendario).

## 5. Modificaciones de Base de Datos
Se requiere una nueva tabla y la ampliación de una tabla existente (ver `supabase/google_calendar_schema.sql`):
- `public.google_calendar_connections`: Almacena credenciales OAuth vinculadas al `user_id`.
- `public.meetings`: Se añaden campos para el estado de sincronización (`google_event_id`, `google_calendar_synced_at`, `google_calendar_sync_status`).

### ⚠️ Riesgos de Seguridad (Tokens)
Si no se encriptan el `access_token` y, sobre todo, el `refresh_token` en la base de datos, un ataque de exposición podría comprometer los calendarios de los usuarios. 
**Recomendación**: Utilizar **Supabase Vault** (si está habilitado) o encriptación simétrica mediante Edge Functions antes de hacer el `INSERT` en la tabla `google_calendar_connections`.

## 6. Rutas / API Propuestas
El flujo de conexión utilizará dos Edge Functions dedicadas para evitar lidiar con secretos en el frontend:
- `google-calendar-auth-start`: Genera la URL de autorización y redirige al usuario a Google.
- `google-calendar-auth-callback`: Recibe el código de Google, lo intercambia por tokens, encripta y guarda en la base de datos.
- `google-calendar-create-event`: Edge Function utilitaria invocable desde otras funciones (como el webhook de Telegram) para inyectar eventos.

## 7. Pasos de Implementación
1. **Configurar aplicación en Google Cloud Console**:
   - Crear un nuevo proyecto o seleccionar uno existente en [Google Cloud Console](https://console.cloud.google.com/).
   - Habilitar la **Google Calendar API**.
   - Configurar la **OAuth consent screen** (Pantalla de consentimiento) seleccionando tipo de usuario "Externo" (si no es Google Workspace). En estado Testing añadir el email de Derlis como *Test user*.
   - Configurar los scopes: `https://www.googleapis.com/auth/calendar.events`
2. **Obtener Credenciales**:
   - Ir a Credentials -> Create Credentials -> OAuth client ID.
   - Tipo de aplicación: Web application.
   - **Authorized redirect URIs**: `https://alvrowgxqusotjwiaryu.supabase.co/functions/v1/google-calendar-callback` (Ajustar al Project Ref real).
   - Copiar `Client ID` y `Client Secret`.
3. **Variables de Entorno (Supabase Secrets)**:
   - Configurar en el proyecto de Supabase (y en el archivo `.env` local para pruebas) mediante el CLI:
     ```bash
     supabase secrets set GOOGLE_CLIENT_ID="tu-client-id"
     supabase secrets set GOOGLE_CLIENT_SECRET="tu-client-secret"
     supabase secrets set GOOGLE_REDIRECT_URI="https://alvrowgxqusotjwiaryu.supabase.co/functions/v1/google-calendar-callback"
     ```
4. Desplegar el esquema SQL propuesto: `supabase/google_calendar_schema.sql`.
5. Escribir y desplegar las funciones de Auth Start y Callback.
6. Crear botón de vinculación real en `/settings` en el frontend.
7. Modificar el webhook de Telegram o utilizar `create-event` para sincronizar.

## 8. Checklist Pre-Despliegue CAL-1
- [ ] Aplicación en Google Cloud verificada (o en estado "Testing" para correos autorizados).
- [ ] Esquema SQL migrado.
- [ ] Edge Functions de Auth desplegadas.
- [ ] Flujo OAuth funcional.
- [ ] Tokens correctamente ofuscados o encriptados.
- [ ] Webhook de Telegram sincronizando.
