import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==========================================
// 1. HELPERS BASICOS
// ==========================================
function isBotGeneratedMessage(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lowerText.includes("✅ detecté") ||
         lowerText.includes("✅ mensaje clasificado") ||
         lowerText.includes("✅ tarea creada") ||
         lowerText.includes("✅ reunión agendada") ||
         lowerText.includes("✅ nota guardada") ||
         lowerText.includes("respondé crear") ||
         lowerText.includes("respondé cancelar") ||
         lowerText.includes("¿en qué sección guardo esto?") ||
         lowerText.includes("¿para qué día") ||
         lowerText.includes("¿a qué hora") ||
         lowerText.includes("guardado en quantum") ||
         lowerText.includes("sección:") ||
         lowerText.includes("título:") ||
         lowerText.includes("prioridad:");
}

function sendTelegramMessage(chat_id: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN || !chat_id) return Promise.resolve();
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  return fetch(telegramApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  }).catch(err => console.error("Error sending TG msg:", err));
}

// ==========================================
// 2. PARSER & INTENT DETECTION
// ==========================================
function detectIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  // Queries
  if (lowerText.includes("qué tengo para hoy") || lowerText.includes("que tengo para hoy")) return "query_today";
  if (lowerText.includes("qué tengo pendiente") || lowerText.includes("que tengo pendiente")) return "query_section_pending";
  if (lowerText.includes("ayuda") || lowerText.includes("help") || lowerText.includes("comandos")) return "query_help";
  
  // Confirmation
  const command = lowerText.trim();
  if (command === "crear") return "confirm_pending";
  if (command === "cancelar") return "cancel_pending";
  
  // Direct Section match for needs_section state
  const validSections = ["familia", "iglesia", "inverfin", "equantum", "idear"];
  if (validSections.includes(command)) return "supply_section";

  // Create
  if (lowerText.includes("reunión") || lowerText.includes("reunion") || lowerText.includes("agendar") || lowerText.includes("encuentro") || lowerText.includes("cita")) return "create_meeting";
  if (lowerText.includes("nota") || lowerText.includes("idea") || lowerText.includes("anotar") || lowerText.includes("apuntar") || lowerText.includes("guardar idea")) return "create_note";
  
  // Default to task if actionable verb
  if (lowerText.includes("recordar") || lowerText.includes("recordarme")) return "create_reminder"; // Treated as task internally

  // Default
  return "create_task";
}

function detectSection(text: string) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("familia") || lowerText.includes("casa") || lowerText.includes("esposa")) return "familia";
  if (lowerText.includes("iglesia") || lowerText.includes("ministerio")) return "iglesia";
  if (lowerText.includes("inverfin")) return "inverfin";
  if (lowerText.includes("equantum") || lowerText.includes("guaramarket") || lowerText.includes("guara market")) return "equantum";
  if (lowerText.includes("idear") || lowerText.includes("facultad") || lowerText.includes("reseña") || lowerText.includes("estudio")) return "idear";
  return null;
}

function extractDateTime(text: string) {
  const lowerText = text.toLowerCase();
  
  let dateLabel = null;
  const dateRegex = /\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i;
  const match = lowerText.match(dateRegex);
  if (match) dateLabel = match[1].toLowerCase();

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

  // Calc ISO Date
  const d = new Date();
  if (dateLabel === 'mañana') d.setDate(d.getDate() + 1);
  else if (dateLabel && dateLabel !== 'hoy') {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'miercoles', 'sabado'];
    const dayIdxMap: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6 };
    if (days.includes(dateLabel)) {
      const targetDay = dayIdxMap[dateLabel];
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // Next week's day
      d.setDate(d.getDate() + diff);
    }
  }

  // If no dateLabel is provided, we default to "hoy" visually for tasks, but leave it explicit if needed.
  const explicitDate = dateLabel || 'hoy';
  const isoDateOnly = d.toISOString().split('T')[0];
  d.setHours(hour ?? 0, minute ?? 0, 0, 0);
  const isoDateTime = d.toISOString();

  return { explicitDate, hour, minute, timeLabel, isoDateOnly, isoDateTime };
}

function cleanTitle(text: string) {
  let cleanTitle = text;
  // 1. Quitar seccion (Familia, eQuantum, etc)
  cleanTitle = cleanTitle.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
  // 2. Quitar ruido comun
  cleanTitle = cleanTitle.replace(/\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|recordar|recordarme|el)\b/ig, "");
  // 3. Quitar verbos y palabras conectores ruidosos
  cleanTitle = cleanTitle.replace(/\b(tengo|una|agenda|agendar|para las|a las|en)\b/ig, "");
  // 4. Quitar horas
  cleanTitle = cleanTitle.replace(/\b\d{1,2}(:\d{2})?\b/ig, "");
  cleanTitle = cleanTitle.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
  cleanTitle = cleanTitle.replace(/✅/g, "");

  cleanTitle = cleanTitle.replace(/\s+/g, " ").trim();
  if (cleanTitle.length > 0) cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  return cleanTitle || "Sin título";
}

function classifyMessage(text: string, intent: string) {
  const section = detectSection(text);
  const dateTime = extractDateTime(text);
  
  let priority = "Media";
  const lower = text.toLowerCase();
  if (lower.includes("urgente") || lower.includes("asap")) priority = "Urgente";
  else if (lower.includes("importante")) priority = "Alta";

  let title = text;
  if (intent === 'create_note') {
    // Para notas, limpiamos menos para no perder contenido.
    title = title.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    title = title.replace(/^(nota|idea|anotar|apuntar):?\s*/i, "");
    if (title.length > 0) title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = cleanTitle(text);
  }

  return { section, title, priority, ...dateTime };
}

// ==========================================
// 3. FLUJOS DE ACCION
// ==========================================

async function handleCancel(chat_id: string, pendingAction: any) {
  if (!pendingAction) {
    await sendTelegramMessage(chat_id, "No hay ninguna acción pendiente.");
    return;
  }
  await supabase
    .from("telegram_pending_actions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", pendingAction.id);
  await sendTelegramMessage(chat_id, "❌ Acción cancelada.");
}

async function handleCreate(chat_id: string, pendingAction: any) {
  if (!pendingAction || pendingAction.status !== "pending") {
    await sendTelegramMessage(chat_id, "No hay ninguna acción pendiente lista para confirmar.");
    return;
  }

  const actionType = pendingAction.action_type;
  const payload = pendingAction.payload;

  let error = null;
  if (actionType === "create_task") {
    const { error: err } = await supabase.from("tasks").insert(payload);
    error = err;
  } else if (actionType === "create_meeting") {
    const { error: err } = await supabase.from("meetings").insert(payload);
    error = err;
  } else if (actionType === "create_note") {
    const { error: err } = await supabase.from("notes").insert(payload);
    error = err;
  } else {
    await sendTelegramMessage(chat_id, "⚠️ Tipo de acción no soportada todavía.");
    return;
  }

  if (error) {
    console.error(`Error guardando ${actionType}:`, error);
    await sendTelegramMessage(chat_id, "⚠️ Detecté esto, pero todavía no pude guardarlo por configuración interna.");
  } else {
    await supabase
      .from("telegram_pending_actions")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", pendingAction.id);
    
    if (actionType === "create_task") await sendTelegramMessage(chat_id, "✅ Tarea creada correctamente.");
    else if (actionType === "create_meeting") await sendTelegramMessage(chat_id, "✅ Reunión agendada correctamente.");
    else if (actionType === "create_note") await sendTelegramMessage(chat_id, "✅ Nota guardada correctamente.");
  }
}

async function handleQueries(chat_id: string, intent: string, text: string) {
  const section = detectSection(text);
  
  if (intent === "query_help") {
    const msg = `🤖 *Asistente Quantum*\nPuedo ayudarte con esto:\n\n` +
      `1. *Tareas*: "Familia leer la biblia a las 19"\n` +
      `2. *Reuniones*: "Mañana reunión en Inverfin con Sony a las 10:30"\n` +
      `3. *Notas*: "eQuantum nota: revisar carrito abandonado"\n` +
      `4. *Consultas*: "Qué tengo para hoy?" o "Qué tengo pendiente en eQuantum?"\n\n` +
      `Simplemente escribime lo que necesitás.`;
    await sendTelegramMessage(chat_id, msg);
    return;
  }

  if (intent === "query_today") {
    const today = new Date().toISOString().split('T')[0];
    const { data: tasks } = await supabase.from("tasks").select("*").not('status', 'eq', 'Terminada').like('due_date', `${today}%`);
    const { data: meetings } = await supabase.from("meetings").select("*").eq('date', today);
    
    let msg = `📅 *Agenda de Hoy*\n\n`;
    if ((!tasks || tasks.length === 0) && (!meetings || meetings.length === 0)) {
      msg += "Libre! No tenés tareas ni reuniones agendadas para hoy.";
    } else {
      if (meetings && meetings.length > 0) {
        msg += `*Reuniones:*\n`;
        meetings.forEach(m => msg += `- ${m.start_time.slice(0,5)} | ${m.title} (${m.section_id})\n`);
        msg += `\n`;
      }
      if (tasks && tasks.length > 0) {
        msg += `*Tareas pendientes:*\n`;
        tasks.forEach(t => msg += `- ${t.title} (${t.section_id})\n`);
      }
    }
    await sendTelegramMessage(chat_id, msg);
    return;
  }

  if (intent === "query_section_pending") {
    if (!section) {
      await sendTelegramMessage(chat_id, "¿De qué sección querés ver los pendientes? Respondé con: Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
      return;
    }
    const { data: tasks } = await supabase.from("tasks").select("*").eq("section_id", section).not('status', 'eq', 'Terminada');
    if (!tasks || tasks.length === 0) {
      await sendTelegramMessage(chat_id, `No tenés tareas pendientes en ${section}.`);
    } else {
      let msg = `📋 *Pendientes en ${section.toUpperCase()}*\n\n`;
      tasks.forEach(t => msg += `- ${t.title} [${t.priority}]\n`);
      await sendTelegramMessage(chat_id, msg);
    }
    return;
  }
}

// ==========================================
// 4. MAIN HANDLER
// ==========================================
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const payload = await req.json();
    const message = payload.message;
    if (!message || !message.text) return new Response("OK", { status: 200 });

    const update_id = payload.update_id?.toString();
    const chat_id = message.chat?.id?.toString();
    const from_id = message.from?.id?.toString();
    const from_username = message.from?.username;
    const text = message.text.trim();

    if (isBotGeneratedMessage(text)) return new Response("OK", { status: 200 });

    // 1. Obtener acción pendiente actual
    const { data: currentPending } = await supabase
      .from("telegram_pending_actions")
      .select("*")
      .eq("telegram_chat_id", chat_id)
      .in("status", ["pending", "needs_section"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const intent = detectIntent(text);

    // 2. Resolver intents de comando directo
    if (intent === "cancel_pending") {
      await handleCancel(chat_id, currentPending);
      return new Response("OK", { status: 200 });
    }

    if (intent === "confirm_pending") {
      if (currentPending?.status === "needs_section") {
        await sendTelegramMessage(chat_id, "⚠️ Todavía me falta la sección. Respondé con: Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
      } else {
        await handleCreate(chat_id, currentPending);
      }
      return new Response("OK", { status: 200 });
    }

    // 3. Resolver flujo multi-turno (needs_section)
    if (currentPending?.status === "needs_section") {
      const detectedSection = detectSection(text);
      if (!detectedSection) {
        await sendTelegramMessage(chat_id, "❌ No reconocí la sección. Escribí Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
        return new Response("OK", { status: 200 });
      }
      
      // Update payload
      const updatedPayload = { ...currentPending.payload, section_id: detectedSection };
      await supabase
        .from("telegram_pending_actions")
        .update({ payload: updatedPayload, status: "pending" })
        .eq("id", currentPending.id);

      // Re-preguntar
      let msg = `Listo, entendí esto:\n\nSección: ${detectedSection}\nTítulo: ${updatedPayload.title}\n`;
      msg += `\nRespondé CREAR o CANCELAR.`;
      await sendTelegramMessage(chat_id, msg);
      return new Response("OK", { status: 200 });
    }

    // 4. Resolver Queries
    if (intent.startsWith("query_")) {
      await handleQueries(chat_id, intent, text);
      return new Response("OK", { status: 200 });
    }

    // 5. Flujo de Creación Nuevo
    const classData = classifyMessage(text, intent);

    // Cancelar viejo si existe y el usuario empezó uno nuevo
    if (currentPending) {
      await supabase
        .from("telegram_pending_actions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", currentPending.id);
    }

    // Guardar logs de auditoria
    const aiJson = {
      itemType: classData.itemType,
      intent: intent,
      section: { sectionId: classData.section, reasoning: "Mock classifier" },
      extractedData: {
        title: classData.title,
        date: classData.explicitDate,
        isoDate: classData.isoDateTime,
        priority: classData.priority
      },
      status: "ready"
    };

    const { data: tgLog } = await supabase.from("telegram_logs").insert({
      telegram_update_id: update_id,
      telegram_chat_id: chat_id,
      telegram_user_id: from_id,
      telegram_username: from_username,
      message_text: text,
      raw_payload: payload,
      ai_raw_response: aiJson
    }).select().single();

    const tgLogId = tgLog?.id;
    let whatsappLogId = null;
    let aiClassificationId = null;
    const { data: waLog } = await supabase.from("whatsapp_logs").insert({
      message_sid: `tg_${update_id}_${Date.now()}`,
      body: text,
      sender_phone: from_username || from_id || "telegram",
      ai_raw_response: aiJson
    }).select("id").single();

    if (waLog) {
      whatsappLogId = waLog.id;
      const { data: aiRes } = await supabase.from("ai_classifications").insert({
        whatsapp_log_id: whatsappLogId,
        original_text: text,
        item_type: intent,
        section_id: classData.section,
        confidence: 0.9,
        reasoning: "Assistant Flow",
        extracted_data: aiJson.extractedData,
        is_ambiguous: false
      }).select("id").single();
      if (aiRes) aiClassificationId = aiRes.id;
    }

    // Detect missing section
    const needsSection = !classData.section;
    const pendingStatus = needsSection ? "needs_section" : "pending";

    let actionType = intent; // create_task, create_meeting, create_note
    if (intent === 'create_reminder') actionType = 'create_task';

    let actionPayload: any = {};
    if (actionType === "create_task") {
      actionPayload = {
        title: classData.title,
        description: text,
        section_id: classData.section,
        priority: classData.priority,
        status: "Pendiente",
        due_date: classData.isoDateTime,
        assignee: "Sin asignar"
      };
    } else if (actionType === "create_meeting") {
      const startH = classData.hour !== null ? String(classData.hour).padStart(2, '0') : "09";
      const startM = classData.minute !== null ? String(classData.minute).padStart(2, '0') : "00";
      const endH = classData.hour !== null ? String((classData.hour + 1) % 24).padStart(2, '0') : "10";
      
      actionPayload = {
        title: classData.title,
        description: text,
        section_id: classData.section,
        date: classData.isoDateOnly,
        start_time: `${startH}:${startM}:00`,
        end_time: `${endH}:${startM}:00`,
        type: "Reunión",
        status: "Agendado"
      };
    } else if (actionType === "create_note") {
      actionPayload = {
        title: classData.title,
        content: text,
        section_id: classData.section
      };
    }

    // Anti-duplicados (solo si hay sección)
    if (!needsSection) {
      if (actionType === "create_task") {
        const { data: dupes } = await supabase.from("tasks").select("id").eq("title", classData.title).eq("section_id", classData.section).limit(1);
        if (dupes && dupes.length > 0) return new Response("OK", { status: 200 }, await sendTelegramMessage(chat_id, "Ya existe una tarea parecida. No lo dupliqué."));
      } else if (actionType === "create_meeting") {
        const { data: dupes } = await supabase.from("meetings").select("id").eq("title", classData.title).eq("section_id", classData.section).eq("date", classData.isoDateOnly).limit(1);
        if (dupes && dupes.length > 0) return new Response("OK", { status: 200 }, await sendTelegramMessage(chat_id, "Ya existe una reunión parecida en esa fecha. No la dupliqué."));
      }
    }

    await supabase.from("telegram_pending_actions").insert({
      telegram_chat_id: chat_id,
      telegram_user_id: from_id,
      action_type: actionType,
      status: pendingStatus,
      classification_id: aiClassificationId,
      telegram_log_id: tgLogId,
      payload: actionPayload
    });

    if (needsSection) {
      await sendTelegramMessage(chat_id, "¿En qué sección guardo esto? Respondé con: Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
    } else {
      let msg = "";
      if (actionType === "create_task") {
        msg = `✅ Detecté una tarea.\n\nSección: ${classData.section}\nTítulo: ${classData.title}\nFecha: ${classData.explicitDate}`;
        if (classData.timeLabel) msg += `\nHora: ${classData.timeLabel}`;
        msg += `\nPrioridad: ${classData.priority}\n\nRespondé CREAR para guardarla como tarea.\nRespondé CANCELAR para descartarla.`;
      } else if (actionType === "create_meeting") {
        msg = `✅ Detecté una reunión.\n\nSección: ${classData.section}\nTítulo: ${classData.title}\nFecha: ${classData.explicitDate}`;
        if (classData.timeLabel) msg += `\nHora: ${classData.timeLabel}`;
        msg += `\n\nRespondé CREAR para agendarla.\nRespondé CANCELAR para descartarla.`;
      } else if (actionType === "create_note") {
        msg = `✅ Detecté una nota para ${classData.section}.\n\nTítulo: ${classData.title}\nContenido: ${text}\n\nRespondé CREAR para guardarla.`;
      }
      await sendTelegramMessage(chat_id, msg);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    return new Response("Error procesado", { status: 200 });
  }
});
