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

## TG-9 Voice Notes
El Asistente es capaz de escuchar notas de voz (`message.voice` o `message.audio`) en la fase TG-9.
- Recibe el audio y lo descarga usando los servidores de Telegram.
- Transcribe el audio utilizando **OpenAI Whisper** (`whisper-1`).
- Pasa el texto transcripto al flujo exacto actual.
- Adapta su respuesta ("Escuché tu audio...") para ser más empático, manteniendo intactas las capacidades de creación de Tareas, Reuniones y Notas con auto-guardado o petición de sección.
