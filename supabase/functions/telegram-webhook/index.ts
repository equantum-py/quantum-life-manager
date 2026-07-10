import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==========================================
// 1. HELPERS BASICOS
// ==========================================
function getMappedUserId(chatId: string | undefined): string | null {
  if (chatId === "5976600727") {
    console.log("[Telegram User Mapping] chat_id 5976600727 mapped to user_id 9a154a6a-a30c-4657-9b0b-11b7cc1b303d");
    return "9a154a6a-a30c-4657-9b0b-11b7cc1b303d";
  }
  return null;
}

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

function capitalizeNames(t: string) {
  return t.replace(/\bbristol\b/ig, "Bristol")
          .replace(/\bsony\b/ig, "Sony")
          .replace(/\bguaramarket\b/ig, "GuaraMarket")
          .replace(/\bequantum\b/ig, "eQuantum")
          .replace(/\binverfin\b/ig, "Inverfin")
          .replace(/\bcorpicia\b/ig, "Corpicia");
}

function normalizeMeetingTitle(t: string) {
  let title = t;
  const lowers = ["con", "la", "de", "del", "el", "para", "en", "las", "los", "un", "una", "y", "o"];
  
  title = title.split(" ").map((w, i) => {
    if (i === 0) return capitalize(w);
    if (lowers.includes(w.toLowerCase())) return w.toLowerCase();
    return w;
  }).join(" ");

  return title;
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
  if (
    lowerText.includes("nota") ||
    lowerText.includes("idea") ||
    lowerText.includes("anota") ||
    lowerText.includes("anotá") ||
    lowerText.includes("anotame") ||
    lowerText.includes("anótame") ||
    lowerText.includes("anotar") ||
    lowerText.includes("apuntar") ||
    lowerText.includes("guarda nota") ||
    lowerText.includes("guardar nota") ||
    lowerText.includes("guardar idea")
  ) return "create_note";
  
  return "create_task";
}

function detectReminderIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("recordar") || 
         lower.includes("recordame") || 
         lower.includes("recuérdame") || 
         lower.includes("avisame") || 
         lower.includes("avisar") || 
         lower.includes("alarma") || 
         lower.includes("notificarme") || 
         lower.includes("minutos antes") ||
         lower.includes("hora antes");
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
    t = t.replace(/\b(anotame|anótame|anota|anotá|anotar|nota:|nota|idea|apuntar|guarda nota|guardar nota|guardar idea)\b/ig, "");
  } else if (intent === 'create_meeting') {
    t = t.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    t = t.replace(/\b(mañana|hoy|tengo|una|reunión|reunion|agenda|agendar|cita|encuentro|en inverfin|inverfin)\b/ig, "");
    t = t.replace(/\b(para las|a las)\s*\d{1,2}(:\d{2})?\b/ig, "");
    t = t.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
  } else {
    t = t.replace(/^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i, "");
    t = t.replace(/\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|recordar|recordarme|el)\b/ig, "");
    t = t.replace(/\b(recordame|avisame|recuérdame|alarma|notificarme)\b/ig, "");
    t = t.replace(/\b(tengo|una|agenda|agendar|para las|a las|en)\b/ig, "");
    t = t.replace(/\b(para las|a las)\s*\d{1,2}(:\d{2})?\b/ig, "");
    t = t.replace(/\b\d{1,2}(:\d{2})?\s*hs\b/ig, "");
    t = t.replace(/\b(15|30|45|60)\s*(minutos|mins|min)\s*antes\b/ig, "");
    t = t.replace(/\b(1|una)\s*hora\s*antes\b/ig, "");
  }

  t = t.replace(/✅/g, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length > 0) t = capitalize(t);
  
  // Limpieza final por si quedó un "sobre" inicial
  if (t.toLowerCase().startsWith("sobre ")) {
      t = t.substring(6).trim();
      if (t.length > 0) t = capitalize(t);
  }
  
  if (intent === 'create_meeting') {
      t = t.replace(/\bcon la gente de\b/ig, "con");
      t = t.replace(/\bcon los de\b/ig, "con");
      
      if (t.toLowerCase().startsWith("con ")) {
          t = "Reunión " + t.charAt(0).toLowerCase() + t.slice(1);
      } else if (!t.toLowerCase().startsWith("reunión")) {
          t = "Reunión sobre " + t.charAt(0).toLowerCase() + t.slice(1);
      }
      
      t = normalizeMeetingTitle(t);
  }
  
  t = capitalizeNames(t);
  
  return t || "Sin título";
}

function classifyMessage(text: string, intent: string) {
  const section = detectSection(text);
  const dateTime = extractDateTime(text);
  
  let priority = "Media";
  const lower = text.toLowerCase();
  if (lower.includes("urgente") || lower.includes("asap")) priority = "Urgente";
  else if (lower.includes("importante")) priority = "Alta";

  const hasReminder = detectReminderIntent(text);
  const title = cleanTitle(text, intent);

  return { section, title, priority, hasReminder, ...dateTime };
}

function shouldAutoSave(intent: string, classData: any) {
  if (!classData.section) return false;
  if (!classData.title || classData.title.toLowerCase() === "sin título") return false;
  if (intent === "create_task" && classData.hasReminder && classData.hour === null) return false;
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
  } else if (actionType === "create_note") {
    const { data } = await supabase.from("notes").select("id").eq("title", classData.title).eq("section_id", classData.section).limit(1);
    return data && data.length > 0;
  }
  return false;
}

function formatNaturalResponse(actionType: string, payload: any, classData: any = null, isVoice: boolean = false, reminderStr: string = "") {
  const sec = capitalize(payload.section_id);
  const rawTitle = payload.title;
  const prefix = isVoice ? "Escuché tu audio. " : "Listo señor, ";
  const altPrefix = isVoice ? "Escuché tu audio. Agendé" : "Listo señor, agendé";
  const savePrefix = isVoice ? "Escuché tu audio. Guardé" : "Listo señor, guardé";
  const rmSuffix = reminderStr ? ` y te voy a recordar ${reminderStr}` : "";

  if (actionType === "create_note") {
    return `${prefix}guardé la nota sobre ${rawTitle.toLowerCase()} en ${sec}.`;
  }
  if (actionType === "create_meeting") {
    const d = classData?.explicitDate || payload.date || "hoy";
    const h = classData?.timeLabel || (payload.start_time ? payload.start_time.slice(0, 5) : "horario a definir");
    let t = rawTitle;
    if (t.toLowerCase().startsWith("reunión ")) {
      t = t.substring(8).trim();
    }
    return `${altPrefix} la reunión ${t} para ${d} a las ${h} en ${sec}${rmSuffix}.`;
  }
  
  // Tasks / Reminders
  const d = classData?.explicitDate || (payload.due_date ? payload.due_date.split('T')[0] : "hoy");
  const timeStr = classData?.timeLabel || (payload.due_date && payload.due_date.includes('T') ? payload.due_date.split('T')[1].slice(0, 5) : "");
  const h = (timeStr && timeStr !== "00:00") ? ` a las ${timeStr}` : "";
  return `${savePrefix} la tarea '${payload.title}' en ${sec}${rmSuffix ? rmSuffix : (h ? ` para ${d}${h}` : ` para ${d}`)}.`;
}

// ==========================================
// 4. TRANSCRIPCION
// ==========================================
async function transcribeAudio(file_id: string, bot_token: string): Promise<string | null> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    console.log("[Voice] Error: Missing OPENAI_API_KEY");
    return null;
  }
  
  try {
    console.log(`[Voice] Requesting file path for file_id: ${file_id.substring(0, 10)}...`);
    const fileRes = await fetch(`https://api.telegram.org/bot${bot_token}/getFile?file_id=${file_id}`);
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) {
      console.log("[Voice] Error getting file path from Telegram");
      return null;
    }
    
    const filePath = fileData.result.file_path;
    console.log(`[Voice] Downloading file from Telegram: ${filePath}`);
    
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${bot_token}/${filePath}`);
    if (!downloadRes.ok) {
      console.log(`[Voice] Error downloading file: ${downloadRes.status}`);
      return null;
    }
    
    const blob = await downloadRes.blob();
    console.log(`[Voice] Downloaded audio blob size: ${blob.size} bytes`);
    
    const file = new File([blob], "voice.ogg", { type: "audio/ogg" });
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    formData.append("language", "es");
    
    console.log("[Voice] Sending to OpenAI Whisper...");
    const aiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });
    
    console.log(`[Voice] OpenAI response status: ${aiRes.status}`);
    const aiData = await aiRes.json();
    if (aiData.error) {
      console.log("[Voice] OpenAI transcription error:", aiData.error.message || "Unknown error");
      return null;
    }
    
    return aiData.text;
  } catch (err: any) {
    console.log("[Voice] Internal Error transcribing audio:", err.message || err);
    return null;
  }
}

// ==========================================
// 5. MAIN HANDLER
// ==========================================
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const payload = await req.json();
    const message = payload.message;
    if (!message) return new Response("OK", { status: 200 });

    const chat_id = message.chat?.id?.toString();
    const update_id = payload.update_id?.toString();
    const from_id = message.from?.id?.toString();
    const from_username = message.from?.username;

    let text = "";
    let isVoice = false;

    if (message.voice || message.audio) {
      const voiceObj = message.voice || message.audio;
      const file_id = voiceObj.file_id;
      const duration = voiceObj.duration;
      
      console.log(`[Voice] Received audio message. Duration: ${duration}s`);
      
      if (duration !== undefined && duration < 2) {
        await sendTelegramMessage(chat_id, "El audio fue muy corto. Enviame una nota de voz un poco más larga, de 3 a 5 segundos.");
        return new Response("OK", { status: 200 });
      }

      if (!file_id) return new Response("OK", { status: 200 });
      
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (!OPENAI_API_KEY) {
        await sendTelegramMessage(chat_id, "Todavía no está configurada la transcripción de audio.");
        return new Response("OK", { status: 200 });
      }

      const transcribed = await transcribeAudio(file_id, TELEGRAM_BOT_TOKEN);
      
      if (!transcribed) {
        await sendTelegramMessage(chat_id, "No pude transcribir el audio. Probá enviarlo más largo y claro, o escribime el pedido.");
        return new Response("OK", { status: 200 });
      }
      text = transcribed.trim();
      isVoice = true;
    } else if (message.text) {
      text = message.text.trim();
    } else {
      return new Response("OK", { status: 200 });
    }

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
      
      const actionType = currentPending.action_type;
      const updatedPayload = { ...currentPending.payload, section_id: sec };
      
      const fakeClassData = { title: updatedPayload.title, section: sec, isoDateOnly: updatedPayload.date, hasReminder: false, hour: 0 };
      if (await checkDuplicates(actionType, fakeClassData)) {
        let msg = "Señor, ya existe algo parecido, así que no lo dupliqué.";
        if (actionType === "create_note") msg = "Señor, ya existe una nota parecida, así que no la dupliqué.";
        await sendTelegramMessage(chat_id, msg);
        await supabase.from("telegram_pending_actions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", currentPending.id);
        return new Response("OK", { status: 200 });
      }

      // Re-evaluar si ahora le falta tiempo (por si originalmente era una tarea con recordatorio sin tiempo)
      // Pero no tenemos el classData original tan a mano. Asumiremos que si la acción es pending, puede seguir.
      // Lo ideal es dejarlo en pending_actions con el payload actualizado.
      // Para simplificar, si era tarea y se detectó sin tiempo antes, ahora lo procesará directamente sin tiempo si no lo capturamos.
      // Mejor: delegar el guardado si falta algo más.
      
      let err = null;
      if (actionType === "create_task") err = (await supabase.from("tasks").insert(updatedPayload)).error;
      else if (actionType === "create_meeting") err = (await supabase.from("meetings").insert(updatedPayload)).error;
      else if (actionType === "create_note") err = (await supabase.from("notes").insert(updatedPayload)).error;

      if (err) {
        await supabase.from("telegram_pending_actions").update({ payload: updatedPayload, status: "pending" }).eq("id", currentPending.id);
        await sendTelegramMessage(chat_id, "Señor, entendí el pedido, pero no pude guardarlo por un problema interno. Lo revisaré en el panel.");
      } else {
        await supabase.from("telegram_pending_actions").update({ payload: updatedPayload, status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", currentPending.id);
        const originalText = updatedPayload.description || updatedPayload.content || "";
        const cData = extractDateTime(originalText);
        await sendTelegramMessage(chat_id, formatNaturalResponse(actionType, updatedPayload, cData, isVoice));
      }
      return new Response("OK", { status: 200 });
    }

    // Supply time para multi-turno
    if (currentPending?.status === "needs_time") {
      const timeData = extractDateTime(text);
      if (timeData.hour === null) {
        await sendTelegramMessage(chat_id, "Señor, no logré entender la hora. ¿Me la confirmás de nuevo? Por ejemplo: 'a las 13:30'.");
        return new Response("OK", { status: 200 });
      }

      const actionType = currentPending.action_type;
      let updatedPayload = { ...currentPending.payload };
      
      // Construir la nueva fecha con la hora
      const origDateStr = updatedPayload.due_date || new Date().toISOString();
      const origD = new Date(origDateStr);
      origD.setHours(timeData.hour, timeData.minute || 0, 0, 0);
      updatedPayload.due_date = origD.toISOString();

      let err = null;
      const { data: insertedTask, error: taskErr } = await supabase.from("tasks").insert(updatedPayload).select().single();
      err = taskErr;

      if (err) {
        await supabase.from("telegram_pending_actions").update({ payload: updatedPayload, status: "pending" }).eq("id", currentPending.id);
        await sendTelegramMessage(chat_id, "Señor, entendí el pedido, pero no pude guardarlo por un problema interno. Lo revisaré en el panel.");
      } else {
        await supabase.from("telegram_pending_actions").update({ payload: updatedPayload, status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", currentPending.id);
        
        let reminderFeedback = `${origD.toISOString().split('T')[0]} a las ${timeData.timeLabel}`;
        const remindAt = origD.toISOString();
        let reminderError = false;

        let userId = getMappedUserId(chat_id);
        if (!userId) {
          const { data: usersData } = await supabase.auth.admin.listUsers();
          userId = usersData?.users?.[0]?.id || null;
        }
        if (userId) {
           console.log(`[Telegram Reminder] Creating reminder with push user_id ${userId}`);
           const { error: rErr } = await supabase.from("reminders").insert({
              user_id: userId,
              source_type: "task",
              source_id: insertedTask.id,
              title: updatedPayload.title,
              remind_at: remindAt,
              channel: "push",
              status: "pending",
              metadata: { created_from: "telegram", original_text: text, source: isVoice ? "voice" : "text", telegram_chat_id: chat_id }
           });
           if (rErr) reminderError = true;
        }
        
        if (reminderError) {
          await sendTelegramMessage(chat_id, "Guardé la tarea con tu hora, pero no pude programar el recordatorio interno.");
        } else {
          // Fake classData para que el formatNaturalResponse lea la hora bien
          const cData = { explicitDate: origDateStr.split('T')[0], timeLabel: timeData.timeLabel };
          await sendTelegramMessage(chat_id, formatNaturalResponse(actionType, updatedPayload, cData, isVoice, reminderFeedback));
        }
      }
      return new Response("OK", { status: 200 });
    }

    // Nuevo comando regular
    const classData = classifyMessage(text, intent);
    let actionType = intent;

    // Anti-dupes
    if (classData.section && await checkDuplicates(actionType, classData)) {
      let msg = "Señor, ya existe algo parecido, así que no lo dupliqué.";
      if (actionType === "create_note") msg = "Señor, ya existe una nota parecida, así que no la dupliqué.";
      await sendTelegramMessage(chat_id, msg);
      return new Response("OK", { status: 200 });
    }

    let actionPayload: any = {};

    if (actionType === "create_task") {
      console.log("[Telegram Task] Creating task without user_id");
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
      console.log("[Telegram Meeting] Creating meeting without user_id");
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
      console.log("[Telegram Note] Creating note without user_id");
      actionPayload = {
        title: classData.title,
        content: text,
        section_id: classData.section
      };
    }

    const aiJson = {
      itemType: intent,
      intent: intent,
      isVoice: isVoice,
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
      let insertedRecord = null;
      
      if (actionType === "create_task") {
        const { data, error } = await supabase.from("tasks").insert(actionPayload).select().single();
        err = error;
        insertedRecord = data;
      } else if (actionType === "create_meeting") {
        const { data, error } = await supabase.from("meetings").insert(actionPayload).select().single();
        err = error;
        insertedRecord = data;
      } else if (actionType === "create_note") {
        err = (await supabase.from("notes").insert(actionPayload)).error;
      }

      if (err) {
        await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: "pending", classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });
        await sendTelegramMessage(chat_id, "Señor, entendí el pedido, pero no pude guardarlo por un problema interno. Quedó pendiente.");
      } else {
        await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: "confirmed", confirmed_at: new Date().toISOString(), classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });
        
        let reminderFeedback = "";
        let reminderError = false;
        
        // Reminder Logic
        if (insertedRecord && (classData.hour !== null || classData.hasReminder)) {
           let remindAt = null;
           if (actionType === "create_task") {
              if (classData.hour !== null) {
                remindAt = classData.isoDateTime;
                reminderFeedback = `${classData.explicitDate} a las ${classData.timeLabel}`;
              } else if (classData.hasReminder && classData.explicitDate) {
                const d = new Date(classData.isoDateTime);
                d.setHours(8,0,0,0);
                remindAt = d.toISOString();
                reminderFeedback = `${classData.explicitDate} a las 08:00`;
              }
           } else if (actionType === "create_meeting") {
              const d = new Date(classData.isoDateTime);
              let subtractMins = 15;
              if (text.toLowerCase().includes("1 hora antes") || text.toLowerCase().includes("una hora antes")) subtractMins = 60;
              d.setMinutes(d.getMinutes() - subtractMins);
              remindAt = d.toISOString();
              reminderFeedback = `${subtractMins} minutos antes`;
           }
           
           if (remindAt) {
             let userId = getMappedUserId(chat_id);
             if (!userId) {
                const { data: usersData } = await supabase.auth.admin.listUsers();
                userId = usersData?.users?.[0]?.id || null;
             }
             if (userId) {
                console.log(`[Telegram Reminder] Creating reminder with push user_id ${userId}`);
                const { error: rErr } = await supabase.from("reminders").insert({
                   user_id: userId,
                   source_type: actionType === "create_task" ? "task" : "meeting",
                   source_id: insertedRecord.id,
                   title: classData.title,
                   remind_at: remindAt,
                   channel: "push",
                   status: "pending",
                   metadata: { created_from: "telegram", original_text: text, source: isVoice ? "voice" : "text", section: classData.section, telegram_chat_id: chat_id }
                });
                if (rErr) {
                  console.error("Error inserting reminder from TG:", rErr);
                  reminderError = true;
                }
             }
           }
        }
        
        if (reminderError) {
          await sendTelegramMessage(chat_id, "Guardé la tarea, pero no pude crear el recordatorio.");
        } else {
          await sendTelegramMessage(chat_id, formatNaturalResponse(actionType, actionPayload, classData, isVoice, reminderFeedback));
        }
      }
    } else {
      // Necesita intervención
      let pStatus = "pending";
      let msg = `Señor, tengo la acción lista:\n\nTítulo: ${classData.title}\n\nRespondé CREAR para guardar o CANCELAR para descartar.`;
      const prefix = isVoice ? "Escuché tu audio. " : "Claro señor. ";

      if (!classData.section) {
        pStatus = "needs_section";
        msg = `${prefix}¿En qué sección lo guardo: Familia, eQuantum, Inverfin, Iglesia o IDEAR?`;
      } else if (actionType === "create_task" && classData.hasReminder && classData.hour === null) {
        pStatus = "needs_time";
        msg = `${prefix}¿A qué hora querés que te recuerde?`;
      }

      await supabase.from("telegram_pending_actions").insert({ telegram_chat_id: chat_id, telegram_user_id: from_id, action_type: actionType, status: pStatus, classification_id: aiClassId, telegram_log_id: tgLog?.id, payload: actionPayload });
      await sendTelegramMessage(chat_id, msg);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    return new Response("Error procesado", { status: 200 });
  }
});
