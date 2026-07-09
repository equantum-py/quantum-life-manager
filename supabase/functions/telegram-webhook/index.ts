import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function isBotGeneratedMessage(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes("✅ detecté una tarea") ||
         lowerText.includes("✅ mensaje clasificado") ||
         lowerText.includes("✅ tarea creada correctamente") ||
         lowerText.includes("respondé crear") ||
         lowerText.includes("respondé cancelar") ||
         lowerText.includes("guardado en quantum life manager") ||
         lowerText.includes("sección:") ||
         lowerText.includes("título:") ||
         lowerText.includes("prioridad:");
}

function getSafeIsoDate(label: string, hour: number | null, minute: number | null) {
  const d = new Date();
  
  if (label === 'mañana') d.setDate(d.getDate() + 1);
  else if (label !== 'hoy') {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'miercoles', 'sabado'];
    const dayIdxMap: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6 };
    
    if (days.includes(label)) {
      const targetDay = dayIdxMap[label];
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // Próximo día
      d.setDate(d.getDate() + diff);
    }
  }

  // Generar ISO sin restar timezone manualmente para evitar descuadres de día en UTC
  d.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return d.toISOString();
}

function mockClassify(text: string) {
  const lowerText = text.toLowerCase();
  
  // 1. Detectar Sección
  let section = null; 
  if (lowerText.includes("familia") || lowerText.includes("casa") || lowerText.includes("esposa")) section = "familia";
  else if (lowerText.includes("iglesia") || lowerText.includes("ministerio")) section = "iglesia";
  else if (lowerText.includes("inverfin")) section = "inverfin";
  else if (lowerText.includes("equantum") || lowerText.includes("guaramarket")) section = "equantum";
  else if (lowerText.includes("idear") || lowerText.includes("facultad") || lowerText.includes("reseña") || lowerText.includes("estudio")) section = "idear";

  // 2. Detectar Tipo
  let itemType = "task";
  if (lowerText.includes("reunión") || lowerText.includes("reunion") || lowerText.includes("evento")) itemType = "meeting";
  else if (lowerText.includes("nota") || lowerText.includes("idea")) itemType = "note";
  else if (lowerText.includes("pagar") || lowerText.includes("pago") || lowerText.includes("comprar")) itemType = "payment";
  else if (lowerText.includes("entregar") && section === "idear") itemType = "academic_delivery";
  else if (lowerText.includes("recordar") || lowerText.includes("recordatorio")) itemType = "reminder";

  // 3. Detectar Fecha y Hora
  let dateLabel = "hoy";
  const dateRegex = /\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i;
  const match = lowerText.match(dateRegex);
  if (match) {
    dateLabel = match[1].toLowerCase();
  }

  let hour = null;
  let minute = null;
  let timeLabel = null;
  const timeRegex = /a las (\d{1,2})(?::(\d{2}))?|(\d{1,2})(?::(\d{2}))?\s*hs/i;
  const timeMatch = lowerText.match(timeRegex);
  if (timeMatch) {
    hour = parseInt(timeMatch[1] || timeMatch[3], 10);
    minute = parseInt(timeMatch[2] || timeMatch[4] || "0", 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } else {
      hour = null;
      minute = null;
    }
  }

  const isoDate = getSafeIsoDate(dateLabel, hour, minute);

  // 4. Detectar Título Limpio
  let cleanTitle = text;
  // Remover sección al inicio
  cleanTitle = cleanTitle.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
  // Remover palabras de fecha y ruido
  cleanTitle = cleanTitle.replace(/\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|recordar|recordarme|el)\b/ig, "");
  // Remover hora
  cleanTitle = cleanTitle.replace(/\ba las \d{1,2}(:\d{2})?\b/ig, "");
  cleanTitle = cleanTitle.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
  
  // Remover ruido extra generado por reenvíos si pasara
  cleanTitle = cleanTitle.replace(/✅/g, "");
  cleanTitle = cleanTitle.replace(/\b(Detecté una tarea|Mensaje clasificado|Sección:|Título:|Fecha:|Hora:|Prioridad:|Respondé CREAR|Respondé CANCELAR|Guardado en Quantum Life Manager)\b/ig, "");

  cleanTitle = cleanTitle.replace(/\s+/g, " ").trim();
  if (cleanTitle.length > 0) cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  if (!cleanTitle) cleanTitle = "Sin título";

  // 5. Prioridad
  let priority = "Media";
  if (lowerText.includes("urgente") || lowerText.includes("asap")) priority = "Urgente";
  else if (lowerText.includes("importante")) priority = "Alta";

  return {
    section,
    itemType,
    title: cleanTitle,
    dateLabel,
    timeLabel,
    isoDate,
    priority,
    confidence: 0.85
  };
}

async function sendTelegramMessage(chat_id: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN || !chat_id) return;
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(telegramApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const payload = await req.json();
    console.log("Payload recibido de Telegram:", JSON.stringify(payload));

    const message = payload.message;
    if (!message || !message.text) {
      return new Response("OK", { status: 200 });
    }

    const update_id = payload.update_id?.toString();
    const chat_id = message.chat?.id?.toString();
    const from_id = message.from?.id?.toString();
    const from_username = message.from?.username;
    const text = message.text;

    const commandText = text.trim().toUpperCase();

    // Defensa Anti-Bot: Ignorar reenvíos o copias del bot
    if (commandText !== "CREAR" && commandText !== "CANCELAR" && isBotGeneratedMessage(text)) {
      await sendTelegramMessage(chat_id, "⚠️ Ese mensaje parece una respuesta del bot. Enviá una tarea nueva, por ejemplo: Familia leer la biblia a las 19.");
      return new Response("OK", { status: 200 });
    }

    // -----------------------------------------------------
    // FLUJO 1: CONFIRMACIÓN DE ACCIONES PENDIENTES
    // -----------------------------------------------------
    if (commandText === "CREAR" || commandText === "CANCELAR") {
      const { data: pendingAction, error: fetchErr } = await supabase
        .from("telegram_pending_actions")
        .select("*")
        .eq("telegram_chat_id", chat_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchErr || !pendingAction) {
        await sendTelegramMessage(chat_id, "No hay ninguna acción pendiente para crear o cancelar.");
        return new Response("OK", { status: 200 });
      }

      if (commandText === "CANCELAR") {
        await supabase
          .from("telegram_pending_actions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("id", pendingAction.id);
        
        await sendTelegramMessage(chat_id, "❌ Acción cancelada.");
        return new Response("OK", { status: 200 });
      }

      if (commandText === "CREAR") {
        if (pendingAction.action_type === "create_task") {
          const taskPayload = pendingAction.payload;
          const { error: insertErr } = await supabase.from("tasks").insert(taskPayload);
          
          if (insertErr) {
            console.error("Error creando task:", insertErr);
            await sendTelegramMessage(chat_id, "❌ Error técnico al intentar crear la tarea.");
          } else {
            await supabase
              .from("telegram_pending_actions")
              .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
              .eq("id", pendingAction.id);
            
            await sendTelegramMessage(chat_id, "✅ Tarea creada correctamente.");
          }
        } else {
           await sendTelegramMessage(chat_id, "⚠️ Tipo de acción no soportada todavía.");
        }
        return new Response("OK", { status: 200 });
      }
    }

    // -----------------------------------------------------
    // FLUJO 2: CLASIFICACIÓN DE MENSAJES NUEVOS
    // -----------------------------------------------------
    const classification = mockClassify(text);
    
    // Validación de seguridad para título limpio
    if (
      classification.title.includes("Detecté una tarea") || 
      classification.title.includes("Sección:") || 
      classification.title.includes("Respondé CREAR") ||
      classification.title.length > 120 || 
      classification.title === "Sin título"
    ) {
      await sendTelegramMessage(chat_id, "⚠️ No pude generar una tarea limpia. Escribí la tarea en una frase simple.");
      return new Response("OK", { status: 200 });
    }

    const aiJson = {
      itemType: classification.itemType,
      section: {
        sectionId: classification.section,
        reasoning: "Mock classifier rule matched."
      },
      confidence: classification.confidence,
      extractedData: {
        title: classification.title,
        date: classification.dateLabel,
        isoDate: classification.isoDate,
        priority: classification.priority
      },
      status: "ready"
    };

    const { data: tgLog, error: tgLogErr } = await supabase.from("telegram_logs").insert({
      telegram_update_id: update_id,
      telegram_chat_id: chat_id,
      telegram_user_id: from_id,
      telegram_username: from_username,
      message_text: text,
      raw_payload: payload,
      ai_raw_response: aiJson
    }).select().single();

    if (tgLogErr) console.error("Error guardando telegram_logs:", tgLogErr);
    const tgLogId = tgLog ? tgLog.id : null;

    // Crear log proxy en whatsapp_logs temporalmente para satisfacer ai_classifications
    let whatsappLogId = null;
    const { data: waLog } = await supabase.from("whatsapp_logs").insert({
      message_sid: `tg_${update_id}_${Date.now()}`,
      body: text,
      sender_phone: from_username || from_id || "telegram",
      ai_raw_response: aiJson
    }).select("id").single();

    let aiClassificationId = null;
    if (waLog) {
      whatsappLogId = waLog.id;
      const { data: aiRes, error: aiErr } = await supabase.from("ai_classifications").insert({
        whatsapp_log_id: whatsappLogId,
        original_text: text,
        item_type: classification.itemType,
        section_id: classification.section,
        confidence: classification.confidence,
        reasoning: "Mock Telegram Classifier",
        extracted_data: aiJson.extractedData,
        is_ambiguous: false
      }).select("id").single();
      
      if (!aiErr && aiRes) aiClassificationId = aiRes.id;
    }

    if (!classification.section) {
      await sendTelegramMessage(chat_id, "⚠️ No pude detectar la sección. Escribí por ejemplo: eQuantum, Familia, IDEAR, Iglesia o Inverfin.");
      return new Response("OK", { status: 200 });
    }

    const taskTypes = ['task', 'reminder', 'payment', 'academic_delivery', 'delivery', 'assignment', 'homework', 'exam', 'study', 'class_task'];
    
    if (taskTypes.includes(classification.itemType)) {
      // 1. Cancelar cualquier pending action vieja para evitar colisiones
      await supabase
        .from("telegram_pending_actions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("telegram_chat_id", chat_id)
        .eq("status", "pending");

      // 2. Crear nueva pending action
      const taskPayload = {
        title: classification.title,
        description: text,
        section_id: classification.section,
        priority: classification.priority,
        status: "Pendiente",
        due_date: classification.isoDate,
        assignee: "Sin asignar"
      };

      await supabase.from("telegram_pending_actions").insert({
        telegram_chat_id: chat_id,
        telegram_user_id: from_id,
        action_type: "create_task",
        status: "pending",
        classification_id: aiClassificationId,
        telegram_log_id: tgLogId,
        payload: taskPayload
      });

      // 3. Responder pidiendo confirmación
      let responseText = `✅ Detecté una tarea.\n\nSección: ${classification.section}\nTítulo: ${classification.title}\nFecha: ${classification.dateLabel}\n`;
      if (classification.timeLabel) {
        responseText += `Hora: ${classification.timeLabel}\n`;
      }
      responseText += `Prioridad: ${classification.priority}\n\nRespondé CREAR para guardarla como tarea.\nRespondé CANCELAR para descartarla.`;
      await sendTelegramMessage(chat_id, responseText);
    } else {
      // Si detecta nota o reunión, por ahora solo avisa pero no pide crear
      let responseText = `✅ Mensaje clasificado como ${classification.itemType}.\n\nSección: ${classification.section}\nTítulo: ${classification.title}\n\n(La creación de notas y reuniones vía Telegram estará disponible pronto).`;
      await sendTelegramMessage(chat_id, responseText);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    return new Response("Error procesado", { status: 200 });
  }
});
