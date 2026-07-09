import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function mockClassify(text: string) {
  const lowerText = text.toLowerCase();
  
  // 1. Detectar Sección
  let section = "equantum"; // fallback
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

  // 3. Detectar Título Limpio
  // Remover nombres de sección comunes del inicio si existen
  let cleanTitle = text;
  const sectionsRegex = /^(equantum|eQuantum|familia|iglesia|inverfin|idear)\s+/i;
  cleanTitle = cleanTitle.replace(sectionsRegex, "");
  // Capitalizar primera letra
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // 4. Detectar Fecha básica
  let dateLabel = "hoy";
  const dateRegex = /\b(mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i;
  const match = lowerText.match(dateRegex);
  if (match) {
    dateLabel = match[1];
  }

  // 5. Prioridad
  let priority = "Media";
  if (lowerText.includes("urgente") || lowerText.includes("asap")) priority = "Urgente";
  else if (lowerText.includes("importante")) priority = "Alta";

  return {
    section,
    itemType,
    title: cleanTitle,
    dateLabel,
    priority,
    confidence: 0.85
  };
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

    // Clasificar usando mock
    const classification = mockClassify(text);

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
        priority: classification.priority
      },
      status: "ready"
    };

    // Guardar en telegram_logs
    const { data: tgLog, error: tgLogErr } = await supabase.from("telegram_logs").insert({
      telegram_update_id: update_id,
      telegram_chat_id: chat_id,
      telegram_user_id: from_id,
      telegram_username: from_username,
      message_text: text,
      raw_payload: payload,
      ai_raw_response: aiJson
    }).select().single();

    if (tgLogErr) {
      console.error("Error guardando telegram_logs:", tgLogErr);
    }

    // Para guardar en ai_classifications que exige whatsapp_log_id NOT NULL en el schema actual,
    // creamos un log "fantasma" en whatsapp_logs para satisfacer la foreign key, 
    // hasta que actualicemos el DB schema nativamente para soportar telegram_log_id.
    let whatsappLogId = null;
    const { data: waLog, error: waLogErr } = await supabase.from("whatsapp_logs").insert({
      message_sid: `tg_${update_id}_${Date.now()}`,
      body: text,
      sender_phone: from_username || from_id || "telegram",
      ai_raw_response: aiJson
    }).select("id").single();

    if (!waLogErr && waLog) {
      whatsappLogId = waLog.id;
      
      const { error: aiErr } = await supabase.from("ai_classifications").insert({
        whatsapp_log_id: whatsappLogId,
        original_text: text,
        item_type: classification.itemType,
        section_id: classification.section,
        confidence: classification.confidence,
        reasoning: "Mock Telegram Classifier",
        extracted_data: aiJson.extractedData,
        is_ambiguous: false
      });
      if (aiErr) console.error("Error guardando ai_classifications:", aiErr);
    } else {
      console.error("Error creando proxy whatsapp_logs:", waLogErr);
    }

    // Preparar respuesta para Telegram
    let responseText = `✅ Mensaje clasificado.\n\nSección: ${classification.section}\nTipo: ${classification.itemType}\nTítulo: ${classification.title}\nFecha: ${classification.dateLabel}\nPrioridad: ${classification.priority}\n\nGuardado en Quantum Life Manager.`;
    
    if (TELEGRAM_BOT_TOKEN && chat_id) {
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat_id, text: responseText }),
      });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    return new Response("Error procesado", { status: 200 });
  }
});
