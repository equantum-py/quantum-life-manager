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

## Ejemplos Reales de Interacción

**1. Tareas (Flujo Clásico)**
> **Usuario:** Familia leer la biblia a las 19
> **Bot:** ✅ Detecté una tarea. Sección: familia, Título: Leer la biblia, Hora: 19:00. Respondé CREAR...
> **Usuario:** CREAR
> **Bot:** ✅ Tarea creada correctamente.

**2. Reuniones**
> **Usuario:** Mañana tengo una reunión en Inverfin con la gente de Sony agenda para las 10:30
> **Bot:** ✅ Detecté una reunión. Sección: inverfin, Título: Reunión con la gente de Sony, Fecha: mañana, Hora: 10:30. Respondé CREAR...
> **Usuario:** CREAR
> **Bot:** ✅ Reunión agendada correctamente.

**3. Notas**
> **Usuario:** eQuantum idea para GuaraMarket: mejorar carrito abandonado
> **Bot:** ✅ Detecté una nota para equantum. Título: Idea para GuaraMarket. Respondé CREAR...
> **Usuario:** CREAR
> **Bot:** ✅ Nota guardada correctamente.

**4. Consultas**
> **Usuario:** Qué tengo para hoy?
> **Bot:** 📅 Agenda de Hoy. (Muestra reuniones y tareas del día o avisa si está libre).

> **Usuario:** Qué tengo pendiente en eQuantum?
> **Bot:** 📋 Pendientes en EQUANTUM. (Lista las tareas pendientes).

**5. Datos Faltantes (Multiturno)**
> **Usuario:** Recordame llamar a mamá mañana
> **Bot:** ¿En qué sección guardo esto? Respondé con: Familia, eQuantum, Inverfin, Iglesia o IDEAR.
> **Usuario:** Familia
> **Bot:** Listo, entendí esto: Sección: familia. Título: Llamar a mamá... Respondé CREAR o CANCELAR.

## Futuro del Parser
Actualmente las funciones `classifyMessage`, `detectIntent` y `extractDateTime` utilizan reglas duras y RegEx. En la fase de integración de IA real, toda la función `classifyMessage` será reemplazada por una llamada directa a OpenAI/Gemini que devolverá un JSON estructurado con el `actionType` y los `extractedData`. La arquitectura de estado `pending_action` se mantendrá intacta.
