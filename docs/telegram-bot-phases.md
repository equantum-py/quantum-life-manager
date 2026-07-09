# Quantum Life Manager: Telegram Bot Integration Phases

Esta es la hoja de ruta estratégica para implementar la ingesta de datos real mediante Telegram. El avance será progresivo y modular.

### TG-1: Crear bot con BotFather
- Configurar el bot en Telegram.
- Obtener el Token de acceso de manera segura.

### TG-2: Crear tabla telegram_logs
- Desplegar la migración SQL `0003_telegram_logs.sql`.
- Registrará auditoría de todas las interacciones de los usuarios con el bot de Telegram.

### TG-3: Crear Supabase Edge Function telegram-webhook
- Programar la función Serverless base de Deno/TypeScript.
- Establecer las llaves secretas y seguridad para validar solicitudes entrantes de la API de Telegram.

### TG-4: Recibir mensajes y responder eco
- Desplegar la Edge Function.
- Asegurar de parsear el JSON de Telegram (`update_id`, `chat.id`, `text`).
- Guardar el payload bruto en `telegram_logs`.
- Enviar un mensaje de respuesta simple: *"✅ Recibido en Quantum Life Manager"*.

### TG-5: Reusar clasificador mock actual (Próximamente)
- Adaptar la heurística actual de `/whatsapp-test` (que ahora será agnóstica de canal) dentro de la Edge Function para parsear entidades localmente, simulando temporalmente la inteligencia de extracción, sin depender todavía de los altos costos de OpenAI.

### TG-6: Guardar ai_classifications (Próximamente)
- Grabar en la base de datos el resultado del clasificador mock.

### TG-7: Crear tarea/nota/reunión con confirmación (Próximamente)
- Si el mensaje clasificado cumple los criterios, inyectar el registro final en las tablas `tasks`, `notes`, o `meetings`.
- Responder al usuario confirmando exactamente qué acción ocurrió en la base de datos.

### TG-8: IA real opcional (Próximamente)
- Reemplazar el clasificador mock en la Edge Function por una llamada real a los LLMs mediante OpenAI (GPT-4o) o Google Gemini.
