# Quantum Life Manager: WhatsApp AI Ingestion Architecture

Este documento define la arquitectura para permitir a Derlis (el usuario) enviar mensajes o notas de voz vía WhatsApp hacia Quantum Life Manager, de modo que la aplicación clasifique e inserte automáticamente los datos en la base de datos, en la sección adecuada.

---

## 1. Flujo Completo
El flujo end-to-end de un mensaje entrante será el siguiente:
1. **Envío del Mensaje**: El usuario envía un texto (o audio, en una futura fase) a su propio número de servicio de WhatsApp.
2. **Recepción Meta Cloud**: Meta recibe el mensaje y dispara un Webhook HTTP `POST` a nuestro endpoint (Supabase Edge Function).
3. **Validación Webhook**: El backend verifica el token de seguridad y el remitente (solo se procesarán mensajes del número autorizado de Derlis).
4. **Procesamiento de IA (Extracción)**: El backend envía el mensaje bruto a un modelo LLM (OpenAI o Google Gemini) junto con un *System Prompt* robusto y un esquema JSON esperado.
5. **Parseo Estructurado**: El LLM devuelve un JSON clasificando la entidad (tarea, reunión, etc.), el área vital a la que pertenece (eQuantum, Familia, etc.), y la fecha implicada.
6. **Inserción de Base de Datos**: El backend inserta la nueva entidad en la tabla de Supabase correspondiente (ej. `tasks` o `meetings`).
7. **Notificación Push / UI Sync**: (Futuro) La UI web actualiza en tiempo real vía Supabase Realtime subscriptions.
8. **Feedback de Confirmación**: El webhook envía una petición POST a la API de Meta enviando un mensaje de vuelta al usuario: *"✅ Guardado en Familia como Tarea para mañana."*

---

## 2. Requisitos Técnicos
- **Canal de WhatsApp**: Una cuenta de Meta for Developers configurada con un número de WhatsApp Business.
- **Backend Serveless**: Un entorno de funciones serverless o servidor rápido. Optaremos por **Supabase Edge Functions** ya que está directamente ligado a la base de datos futura.
- **LLM Provider**: API Key de OpenAI (GPT-4o / GPT-4o-mini) o Gemini (Flash) para realizar la extracción de datos con formato estructurado (Structured Outputs).
- **Base de Datos**: PostgreSQL en Supabase.

---

## 3. Selección de API: Meta WhatsApp Cloud API vs Proveedores (Twilio, etc.)
Se utilizará de manera directa la **Meta WhatsApp Cloud API**.
- **Ventajas**: Es 100% nativa, sin sobrecostos de intermediarios. Los primeros 1000 mensajes mensuales de "servicio al cliente" son gratuitos.
- **Limitación**: El setup requiere verificar un negocio en Meta y asociar un número de teléfono. Twilio es más rápido al principio para pruebas ("Sandbox"), pero Meta Cloud API es más sostenible y económica a largo plazo.

---

## 4. Tablas en Supabase Necesarias
El paso a Supabase (abandonando localStorage) implicará crear las siguientes tablas:

1. `users`: Gestión de roles y permisos.
2. `sections`: Catálogo de las áreas (familia, iglesia, inverfin, equantum, idear).
3. `tasks`: Tareas (vínculo a sectionId, prioridad, dueDate).
4. `meetings`: Eventos o reuniones en calendario.
5. `notes`: Notas sueltas.
6. `projects`: Proyectos generales.
7. `whatsapp_logs`: Tabla de auditoría para guardar la conversación.
   - `id`, `message_sid`, `body`, `sender_phone`, `ai_raw_response`, `created_at`.
   - Útil para debugear cuándo la IA se equivoca.

---

## 5. Endpoints del Backend
En una Edge Function de Supabase, se implementarán dos manejadores bajo una misma ruta `/api/webhook/whatsapp`:
- **`GET`**: Exigido por Meta Cloud API. Responde con el `hub.challenge` de validación al configurar el webhook.
- **`POST`**: Manejador asíncrono para los mensajes entrantes. 
  - *Atención*: Meta espera que el Webhook devuelva un estado `200 OK` en menos de 3 segundos, o volverá a intentar la petición. Ya que la llamada a la IA puede tardar 2-5 segundos, el webhook debe devolver un `200 OK` inmediatamente y procesar el parseo en segundo plano (vía un worker o enviando el proceso a un Edge background invocation).

---

## 6. Cómo clasificar mensajes por sección (Áreas)
El *System Prompt* provisto al LLM debe contener la lista exacta y estricta de IDs de secciones:
`['familia', 'iglesia', 'inverfin', 'equantum', 'idear']`.
El modelo usará deducción semántica. Ejemplo:
- Si el mensaje dice "propuesta para GuaraMarket", la IA asociará esto lógicamente con clientes y tecnología, asignando "equantum".
- Si dice "pagar la luz", deducirá gastos hogareños, asignando "familia".

---

## 7. Detección de Tipos (Tareas, Recordatorios, Reuniones...)
Se forzará a la IA a retornar un campo `item_type` que sea un Enum estricto de TypeScript:
`'task' | 'reminder' | 'note' | 'meeting' | 'event' | 'payment' | 'academic_delivery' | 'project' | 'idea'`.
El esquema JSON requerido a la IA obligará a llenar las propiedades según el tipo (ej. un `meeting` obliga a retornar `startTime` y `endTime`).

---

## 8. Manejo de Mensajes Ambiguos
¿Qué pasa si el usuario dice "guardar esto: comprar cable"? ¿Es Inverfin, es eQuantum o es Familia?
Si la IA tiene un "Confidence Score" bajo (menor al 70%) para determinar la sección o los datos obligatorios:
- El webhook NO inserta el dato en la BD principal.
- Lo guarda en un estado temporal o responde al usuario por WhatsApp: *"❓ ¿Para qué área es esto? (Responde con el número: 1. Familia, 2. eQuantum, 3. Inverfin...)"*.

---

## 9. Respuesta por WhatsApp (Confirmación)
Al finalizar la inserción en BD exitosamente, la Edge Function invocará el endpoint de mensajes de salida de Meta:
`POST https://graph.facebook.com/v20.0/{phone_number_id}/messages`
Payload:
```json
{
  "messaging_product": "whatsapp",
  "to": "NUMERO_DERLIS",
  "type": "text",
  "text": { "body": "✅ Guardado como Tarea en eQuantum." }
}
```

---

## 10. Riesgos y Limitaciones
- **Timeout del Webhook**: Si la Edge function tarda más de 3 segundos en responder a Meta por la latencia de OpenAI, Meta enviará el mismo mensaje repetidas veces causando inserciones duplicadas. (Se soluciona con manejo de colas de background o verificación de unicidad de Message ID).
- **Audio no implementado inicialmente**: La Cloud API maneja audios, pero requieren ser descargados y enviados a Whisper API antes del LLM. Incrementa la complejidad de la fase 1.
- **Costos**: Aunque WhatsApp es gratis, invocar GPT-4o o Gemini Flash tiene un costo microscópico por llamada.

---

## 11. Fases de Implementación
1. **Fase 1: Estructura Local (Actual)**. Documentación técnica y generación de tipos TypeScript en el repositorio (`src/types/whatsapp.ts`).
2. **Fase 2: Infraestructura Supabase**. Creación del proyecto Supabase, migración de los datos del LocalStorage a tablas reales, autenticación real.
3. **Fase 3: Edge Function Echo**. Configurar cuenta de Meta Developers, registrar Webhook en Supabase Edge Function, y crear un bot "eco" que responda exactamente lo que Derlis envía.
4. **Fase 4: IA Ingestion & Producción**. Conectar la Edge function con OpenAI Structured Outputs, parsear, guardar en base de datos de manera oficial y manejar casos ambiguos.
