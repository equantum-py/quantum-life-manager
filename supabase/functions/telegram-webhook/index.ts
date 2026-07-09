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
  return lowerText.includes("listo señor") ||
         lowerText.includes("señor, ya existe") ||
         lowerText.includes("señor, entendí el pedido") ||
         lowerText.includes("señor, para hoy") ||
         lowerText.includes("✅ detecté") ||
         lowerText.includes("✅ mensaje clasificado") ||
         lowerText.includes("✅ tarea creada") ||
         lowerText.includes("✅ reunión agendada") ||
         lowerText.includes("✅ nota guardada") ||
         lowerText.includes("respondé crear") ||
         lowerText.includes("respondé cancelar") ||
         lowerText.includes("¿en qué sección") ||
         lowerText.includes("¿para qué día") ||
         lowerText.includes("¿a qué hora") ||
         lowerText.includes("sección:") ||
         lowerText.includes("título:");
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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ==========================================
// 2. PARSER & INTENT DETECTION
// ==========================================
function detectIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("qué tengo para hoy") || lowerText.includes("que tengo para hoy")) return "query_today";
  if (lowerText.includes("qué tengo pendiente") || lowerText.includes("que tengo pendiente")) return "query_section_pending";
  if (lowerText.includes("ayuda") || lowerText.includes("help") || lowerText.includes("comandos")) return "query_help";
  
  const command = lowerText.trim();
  if (command === "crear") return "confirm_pending";
  if (command === "cancelar") return "cancel_pending";
  
  const validSections = ["familia", "iglesia", "inverfin", "equantum", "idear"];
  if (validSections.includes(command)) return "supply_section";

  if (lowerText.includes("reunión") || lowerText.includes("reunion") || lowerText.includes("agendar") || lowerText.includes("encuentro") || lowerText.includes("cita")) return "create_meeting";
  if (lowerText.includes("nota") || lowerText.includes("idea") || lowerText.includes("anotar") || lowerText.includes("apuntar") || lowerText.includes("guardar idea")) return "create_note";
  if (lowerText.includes("recordar") || lowerText.includes("recordarme")) return "create_reminder";
  
  return "create_task";
}

function detectSection(text: string) {
  const lowerText = text.toLowerCase();
  if (lowerText.match(/\b(equantum|guaramarket|guara market|corpicia|marmolería|marmoleria|joyerialis|portal cooperativo)\b/)) return "equantum";
  if (lowerText.match(/\b(inverfin|sony)\b/)) return "inverfin";
  if (lowerText.match(/\b(familia|casa|esposa|mamá|biblia familiar|luz)\b/)) return "familia";
  if (lowerText.match(/\b(idear|facultad|reseña|piper|estudio)\b/)) return "idear";
  if (lowerText.match(/\b(iglesia|ministerio|culto)\b/)) return "iglesia";
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
  const timeRegex = /a las (\d{1,2})(?::(\d{2}))?|para las (\d{1,2})(?::(\d{2}))?|(\d{1,2})(?::(\d{2}))?\s*hs/i;
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

  const d = new Date();
  if (dateLabel === 'mañana') d.setDate(d.getDate() + 1);
  else if (dateLabel && dateLabel !== 'hoy') {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'miercoles', 'sabado'];
    const dayIdxMap: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6 };
    if (days.includes(dateLabel)) {
      const targetDay = dayIdxMap[dateLabel];
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
    }
  }

  const explicitDate = dateLabel || 'hoy';
  const isoDateOnly = d.toISOString().split('T')[0];
  d.setHours(hour ?? 0, minute ?? 0, 0, 0);
  const isoDateTime = d.toISOString();

  return { explicitDate, hour, minute, timeLabel, isoDateOnly, isoDateTime };
}

function cleanTitle(text: string, intent: string) {
  let t = text;
  
  if (intent === 'create_note') {
    t = t.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    t = t.replace(/\b(anota|anotar|nota:|nota|idea|apuntar|guardar idea)\b/ig, "");
  } else if (intent === 'create_meeting') {
    t = t.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    t = t.replace(/\b(mañana|hoy|tengo|una|reunión|reunion|agenda|agendar|cita|encuentro|en inverfin|inverfin)\b/ig, "");
    t = t.replace(/\b(para las|a las)\s*\d{1,2}(:\d{2})?\b/ig, "");
    t = t.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
  } else {
    t = t.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    t = t.replace(/\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|recordar|recordarme|el)\b/ig, "");
    t = t.replace(/\b(tengo|una|agenda|agendar|para las|a las|en)\b/ig, "");
    t = t.replace(/\b(para las|a las)\s*\d{1,2}(:\d{2})?\b/ig, "");
    t = t.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
  }

  t = t.replace(/✅/g, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length > 0) t = capitalize(t);
  
  // Limpieza final por si quedó un "sobre" inicial de reuniones "reunion sobre..."
  if (t.toLowerCase().startsWith("sobre ")) {
      t = capitalize(t.substring(6));
  }
  
  return t || "Sin título";
}

function classifyMessage(text: string, intent: string) {
  const section = detectSection(text);
  const dateTime = extractDateTime(text);
  
  let priority = "Media";
  const lower = text.toLowerCase();
  if (lower.includes("urgente") || lower.includes("asap")) priority = "Urgente";
  else if (lower.includes("importante")) priority = "Alta";

  const title = cleanTitle(text, intent);

  return { section, title, priority, ...dateTime };
}

function shouldAutoSave(intent: string, classData: any) {
  if (!classData.section) return false;
  if (!classData.title || classData.title.toLowerCase() === "sin título") return false;
  return true;
}

// ==========================================
// 3. FLUJOS DIRECTOS
// ==========================================

async function checkDuplicates(actionType: string, classData: any) {
  if (actionType === "create_task") {
    const { data } = await supabase.from("tasks").select("id").eq("title", classData.title).eq("section_id", classData.section).limit(1);
    return data && data.length > 0;
  } else if (actionType === "create_meeting") {
    const { data } = await supabase.from("meetings").select("id").eq("title", classData.title).eq("section_id", classData.section).eq("date", classData.isoDateOnly).limit(1);
    return data && data.length > 0;
  }
  return false;
}

function formatNaturalResponse(actionType: string, payload: any, classData: any) {
  const sec = capitalize(payload.section_id);
  const t = payload.title.toLowerCase().startsWith("reunión") ? payload.title.substring(8).trim() : payload.title;

  if (actionType === "create_note") {
    return `Listo señor, guardé la nota sobre ${t.toLowerCase()} en ${sec}.`;
  }
  if (actionType === "create_meeting") {
    const d = classData.explicitDate;
    const h = classData.timeLabel || "horario a definir";
    return `Listo señor, agendé la reunión ${t.toLowerCase().includes("con") ? "" : "sobre"} ${t.toLowerCase()} para ${d} a las ${h} en ${sec}.`;
  }
  
  // Tasks / Reminders
  const d = classData.explicitDate;
  const h = classData.timeLabel ? ` a las ${classData.timeLabel}` : "";
  return `Listo señor, guardé la tarea "${payload.title}" para ${d}${h} en ${sec}.`;
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

    const { data: currentPending } = await supabase
      .from("telegram_pending_actions")
      .select("*")
      .eq("telegram_chat_id", chat_id)
      .in("status", ["pending", "needs_section"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const intent = detectIntent(text);

    // Queries
    if (intent === "query_help") {
      const msg = `🤖 *Asistente Quantum*\nPuedo ayudarte con esto:\n\n` +
        `1. *Tareas*: "Familia leer la biblia a las 19"\n` +
        `2. *Reuniones*: "Mañana reunión en Inverfin con Sony a las 10:30"\n` +
        `3. *Notas*: "Anota revisar carrito abandonado de GuaraMarket"\n` +
        `4. *Consultas*: "Qué tengo para hoy?"\n\n` +
        `Te responderé como tu asistente personal.`;
      await sendTelegramMessage(chat_id, msg);
      return new Response("OK", { status: 200 });
    }

    if (intent === "query_today") {
      const today = new Date().toISOString().split('T')[0];
      const { data: tasks } = await supabase.from("tasks").select("*").not('status', 'eq', 'Terminada').like('due_date', `${today}%`);
      const { data: meetings } = await supabase.from("meetings").select("*").eq('date', today);
      
      let msg = `Señor, para hoy tenés:\n\n`;
      if ((!tasks || tasks.length === 0) && (!meetings || meetings.length === 0)) {
        msg = "Señor, para hoy no tenés tareas ni reuniones agendadas. ¡Día libre!";
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
      return new Response("OK", { status: 200 });
    }

    if (intent === "query_section_pending") {
      const sec = detectSection(text);
      if (!sec) {
        await sendTelegramMessage(chat_id, "Señor, ¿de qué sección querés ver los pendientes? Respondé: Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
        return new Response("OK", { status: 200 });
      }
      const { data: tasks } = await supabase.from("tasks").select("*").eq("section_id", sec).not('status', 'eq', 'Terminada');
      if (!tasks || tasks.length === 0) {
        await sendTelegramMessage(chat_id, `Señor, no tenés tareas pendientes en ${capitalize(sec)}.`);
      } else {
        let msg = `Señor, aquí están los pendientes de ${capitalize(sec)}:\n\n`;
        tasks.forEach(t => msg += `- ${t.title} [${t.priority}]\n`);
        await sendTelegramMessage(chat_id, msg);
      }
      return new Response("OK", { status: 200 });
    }

    // Cancelar/Confirmar explicit (fallback manual)
    if (intent === "cancel_pending") {
      if (currentPending) {
        await supabase.from("telegram_pending_actions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", currentPending.id);
        await sendTelegramMessage(chat_id, "Listo señor, lo descarté.");
      } else {
        await sendTelegramMessage(chat_id, "Señor, no tengo ninguna acción pendiente para cancelar.");
      }
      return new Response("OK", { status: 200 });
    }

    if (intent === "confirm_pending" && currentPending) {
      if (currentPending.status === "needs_section") {
        await sendTelegramMessage(chat_id, "Señor, todavía me falta saber la sección: Familia, eQuantum, Inverfin, Iglesia o IDEAR.");
        return new Response("OK", { status: 200 });
      }
      
      const payload = currentPending.payload;
      const act = currentPending.action_type;
      let err = null;
      if (act === "create_task") err = (await supabase.from("tasks").insert(payload)).error;
      else if (act === "create_meeting") err = (await supabase.from("meetings").insert(payload)).error;
      else if (act === "create_note") err = (await supabase.from("notes").insert(payload)).error;
      
      if (err) {
        await sendTelegramMessage(chat_id, "Señor, entendí el pedido, pero no pude guardarlo por un problema interno. Lo revisaré en el panel.");
      } else {
        await supabase.from("telegram_pending_actions").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", currentPending.id);
        await sendTelegramMessage(chat_id, "Listo señor, lo guardé correctamente.");
      }
      return new Response("OK", { status: 200 });
    }

    // Supply section para multi-turno
    if (currentPending?.status === "needs_section") {
      const sec = detectSection(text);
      if (!sec) {
        await sendTelegramMessage(chat_id, "Señor, no reconocí la sección. ¿Es Familia, eQuantum, Inverfin, Iglesia o IDEAR?");
        return new Response("OK", { status: 200 });
      }
      const updatedPayload = { ...currentPending.payload, section_id: sec };
      await supabase.from("telegram_pending_actions").update({ payload: updatedPayload, status: "pending" }).eq("id", currentPending.id);
      
      await sendTelegramMessage(chat_id, `Entendido, sección ${capitalize(sec)}. ¿Desea guardarlo ahora? Respondé CREAR o CANCELAR.`);
      return new Response("OK", { status: 200 });
    }

    // Nuevo comando regular
    const classData = classifyMessage(text, intent);
    let actionType = intent; 
    if (intent === 'create_reminder') actionType = 'create_task';

    // Anti-dupes
    if (classData.section && await checkDuplicates(actionType, classData)) {
      await sendTelegramMessage(chat_id, "Señor, ya existe algo parecido, así que no lo dupliqué.");
      return new Response("OK", { status: 200 });
    }

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

    const aiJson = {
      itemType: intent,
      intent: intent,
      section: { sectionId: classData.section, reasoning: "Mock classifier natural" },
      extractedData: { title: classData.title, date: classData.explicitDate, isoDate: classData.isoDateTime, priority: classData.priority },
      status: "ready"
    };

    // Auditoria general
    const { data: tgLog } = await supabase.from("telegram_logs").insert({ telegram_update_id: update_id, telegram_chat_id: chat_id, telegram_user_id: from_id, telegram_username: from_username, message_text: text, raw_payload: payload, ai_raw_response: aiJson }).select().single();
    let waLogId = null, aiClassId = null;
    const { data: waLog } = await supabase.from("whatsapp_logs").insert({ message_sid: `tg_${update_id}_${Date.now()}`, body: text, sender_phone: from_username || from_id || "telegram", ai_raw_response: aiJson }).select("id").single();
    if (waLog) {
      waLogId = waLog.id;
      const { data: aiRes } = await supabase.from("ai_classifications").insert({ whatsapp_log_id: waLogId, original_text: text, item_type: intent, section_id: classData.section, confidence: 0.9, reasoning: "Assistant Flow Natural", extracted_data: aiJson.extractedData, is_ambiguous: false }).select("id").single();
      if (aiRes) aiClassId = aiRes.id;
    }

    if (currentPending) {
      await supabase.from("telegram_pending_actions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", currentPending.id);
    }

    if (shouldAutoSave(intent, classData)) {
      let err = null;
      if (actionType === "create_task") err = (await supabase.from("tasks").insert(actionPayload)).error;
      else if (actionType === "create_meeting") err = (await supabase.from("meetings").insert(actionPayload)).error;
      else if (actionType === "create_note") err = (await supabase.from("notes").insert(actionPayload)).error;

      if (err) {
        await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: "pending", classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });
        await sendTelegramMessage(chat_id, "Señor, entendí el pedido, pero no pude guardarlo por un problema interno. Quedó pendiente.");
      } else {
        await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: "confirmed", confirmed_at: new Date().toISOString(), classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });
        await sendTelegramMessage(chat_id, formatNaturalResponse(actionType, actionPayload, classData));
      }
    } else {
      // Necesita intervención
      const pStatus = classData.section ? "pending" : "needs_section";
      await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: pStatus, classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });

      if (pStatus === "needs_section") {
        await sendTelegramMessage(chat_id, "Claro señor. ¿En qué sección lo guardo: Familia, eQuantum, Inverfin, Iglesia o IDEAR?");
      } else {
        await sendTelegramMessage(chat_id, `Señor, tengo la acción lista:\n\nTítulo: ${classData.title}\n\nRespondé CREAR para guardar o CANCELAR para descartar.`);
      }
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    return new Response("Error procesado", { status: 200 });
  }
});
