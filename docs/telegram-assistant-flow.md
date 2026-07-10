# Telegram Assistant Flow (Fase TG-8)

El bot de Telegram de Quantum Life Manager ya no es un simple webhook, sino un Asistente Personal (24/7) que interpreta intenciones mediante un motor mock inicial (preparado para ser reemplazado por IA real).

## Intents Soportados

El bot evalúa el mensaje entrante y detecta una de las siguientes intenciones (`detectIntent`):

- `query_today`: Retorna un resumen de tareas y reuniones de hoy.
- `query_section_pending`: Retorna tareas pendientes de una sección específica.
- `query_help`: Devuelve comandos de ayuda y ejemplos.
- `create_task`: (Por defecto) Intenta extraer título, fecha y sección para agendar una tarea.
- `create_meeting`: Extrae fecha y hora explícita y sugiere agendar en `public.meetings`.
- `create_note`: Guarda la intención directa en texto libre para la tabla `public.notes`.
- `create_reminder`: Tratado internamente como `create_task`.
- `confirm_pending`: "CREAR" confirma la acción previa y la graba en base de datos.
- `cancel_pending`: "CANCELAR" descarta la acción previa.
- `supply_section`: Respuesta a estado `needs_section` para completar un requerimiento faltante.
- `supply_time`: Respuesta a estado `needs_time` cuando una tarea con recordatorio no tiene hora definida.

## Ejemplos Reales de Interacción (Modo Natural)

**1. Notas (Auto-guardado Directo)**
> **Usuario:** anota revisar carrito abandonado de GuaraMarket
> **Bot:** Listo señor, guardé la nota sobre revisar carrito abandonado de Guaramarket en Equantum.
*(Se crea automáticamente en public.notes y el registro pasa directo a confirmado).*

**2. Reuniones (Auto-guardado Directo)**
> **Usuario:** mañana tengo una reunión en Inverfin con la gente de Sony agenda para las 10:35
> **Bot:** Listo señor, agendé la reunión con la gente de Sony para mañana a las 10:35 en Inverfin.
*(Se crea en public.meetings y pasa directo a confirmado).*

**3. Tareas (Auto-guardado Directo)**
> **Usuario:** Familia leer la biblia a las 19
> **Bot:** Listo señor, guardé la tarea "Leer la biblia" para hoy a las 19:00 en Familia.
*(Se crea en public.tasks).*

**4. Consultas (Flujo Directo)**
> **Usuario:** Qué tengo para hoy?
> **Bot:** Señor, para hoy tenés... (Lista de tareas y reuniones, sin intentar crear nada).

**5. Datos Faltantes (Auto-guardado tras Sección)**
> **Usuario:** mañana tengo una reunión con la gente de bristol agenda para las 10:35
> **Bot:** Claro señor. ¿En qué sección lo guardo: Familia, eQuantum, Inverfin, Iglesia o IDEAR?
> **Usuario:** Inverfin
> **Bot:** Listo señor, agendé la reunión con Bristol para mañana a las 10:35 en Inverfin.
*(Se normaliza el título, se crea en la base de datos respectiva y el registro pasa directo a confirmado).*

**6. Ambigüedad (Fallback a CREAR/CANCELAR)**
> **Usuario:** Recordame llamar mañana en Inverfin
> **Bot:** Señor, tengo la acción lista: Título: Llamar mañana... Respondé CREAR para guardar o CANCELAR para descartar.

## Futuro del Parser
Actualmente las funciones `classifyMessage`, `detectIntent` y `extractDateTime` utilizan reglas duras y RegEx. En la fase de integración de IA real, toda la función `classifyMessage` será reemplazada por una llamada directa a OpenAI/Gemini que devolverá un JSON estructurado con el `actionType` y los `extractedData`. La arquitectura de estado `pending_action` se mantendrá intacta.

### 4. Transcripción de Audio (TG-9 Voice Notes)
El bot soporta audios a través de la API `getFile` de Telegram y Whisper-1 de OpenAI.
Si envías una nota de voz, el webhook descarga el audio, lo transcribe, y lo inyecta como texto en el mismo flujo clasificador anterior (detecta sección, fecha, título y recordatorios de la misma forma que con texto).

### 5. Recordatorios Autónomos (TG-10)
Al crear una tarea o reunión por texto o voz, el bot detecta automáticamente si existe intención de recordatorio y programa el envío por notificaciones Push Automáticas (canal `push`).

**Para tareas:**
- Si especificas una hora (Ej: *"Revisar base hoy a las 19"*), se guarda automáticamente con recordatorio a esa hora.
- Si dices *"Recordame comprar leche mañana"*, y no das hora, el bot entra en estado `needs_time` y te pregunta: *"¿A qué hora querés que te recuerde?"* hasta que respondas con un horario claro.

**Para reuniones:**
- Al decir *"Reunión con Daniel mañana a las 9 y avisame 15 minutos antes"*, programa la alarma 15 mins antes.
- El tiempo por defecto de pre-aviso si solo dices *"y recordame"* es de 15 minutos.

El bot elimina del título frases de alarma ("recordame", "avisame", "15 minutos antes") para mantener tu panel limpio, y luego te confirma: *"Listo señor, guardé la tarea 'X' en Y y te voy a recordar..."*

### Despliegue (Deploy) de Edge Function
El despliegue de la función `telegram-webhook` se realiza mediante **GitHub Actions** (`.github/workflows/deploy-supabase-function.yml`), el cual:
- Permite la ejecución manual (`workflow_dispatch`).
- Utiliza la CLI de Supabase en Ubuntu para publicar el código al entorno productivo.
- Requiere tener el secreto `SUPABASE_ACCESS_TOKEN` configurado en el repositorio de GitHub.
- Requiere tener el secreto `OPENAI_API_KEY` configurado internamente en Supabase Secrets (para la función de Whisper).

### 6. Mapeo de Usuarios
*(Nota: Telegram `chat_id` `5976600727` está explícitamente mapeado al usuario interno `Derlis` (`9a154a6a-a30c-4657-9b0b-11b7cc1b303d`) para asegurar que todos los registros y recordatorios Push se vinculen correctamente a su dispositivo).*

