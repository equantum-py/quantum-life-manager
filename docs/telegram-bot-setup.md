# Quantum Life Manager: Telegram Bot Setup

## ¿Por qué Telegram primero?
La decisión de iniciar la fase de ingesta real usando **Telegram** en lugar de **WhatsApp (Meta Cloud API)** se debe a dos razones fundamentales:
1. **Ausencia de fricción**: La API de bots de Telegram es 100% abierta y gratuita, no requiere verificación comercial de Meta ni asociación de tarjetas de crédito.
2. **Costo Cero a Corto Plazo**: No hay cobros por envío/recepción de mensajes. Los únicos costos posibles provienen del escalamiento de Vercel, Supabase o las llamadas a la IA (cuando se integre).

## 1. Crear un bot con BotFather
1. Abre Telegram y busca a **@BotFather**.
2. Envía el comando `/newbot`.
3. Elige un nombre visible para el bot (ej. *Quantum Life Assistant*).
4. Elige un `username` único que termine en `bot` (ej. *QuantumLife_bot*).
5. BotFather te responderá con un mensaje confirmando la creación y te entregará el **TELEGRAM_BOT_TOKEN**.

## 2. Variables de Entorno y Secretos
Para que la Edge Function de Supabase funcione, deberás configurar de forma segura las siguientes variables en el Dashboard de Supabase (Settings > Edge Functions > Secrets):

- `TELEGRAM_BOT_TOKEN`: El token provisto por BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: Un string aleatorio inventado por ti (ej. `quantum_secret_2026`) para garantizar que las peticiones POST provienen realmente de Telegram.
- `SUPABASE_URL`: La URL de tu proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: La llave maestra que le permitirá a la Edge Function escribir en `telegram_logs` esquivando RLS.

**Seguridad**: Estos tokens NUNCA deben ir en `.env.local` del frontend de React/Vite. Son secretos puros del backend.

## 3. Obtener el Chat ID (Opcional, para pruebas locales)
El bot obtendrá dinámicamente el `chat_id` cuando le hables, pero si deseas enviarte mensajes proactivamente, debes enviarle un mensaje al bot y luego visitar en tu navegador:
`https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`
Ahí podrás extraer tu `chat.id` y `from.id`.

## 4. Configurar el Webhook
Una vez que el código de tu Edge Function (`telegram-webhook`) esté desplegado en Supabase, debes decirle a Telegram que envíe allí los mensajes.

Ejecuta este comando curl (o visita la URL en tu navegador reemplazando las variables):
```bash
curl -F "url=https://[TU_PROYECTO].supabase.co/functions/v1/telegram-webhook" \
     -F "secret_token=[TU_TELEGRAM_WEBHOOK_SECRET]" \
     "https://api.telegram.org/bot[TELEGRAM_BOT_TOKEN]/setWebhook"
```

## 5. Probar el Bot
1. Abre Telegram y busca el `@username` de tu bot.
2. Presiona "Iniciar" o envíale un mensaje cualquiera.
3. El webhook en Supabase interceptará el mensaje, lo guardará en la tabla `telegram_logs` y te responderá inmediatamente un texto de confirmación.
