import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Manejo de preflight CORS si fuera necesario
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    // 1. Extraer payload de Telegram
    const payload = await req.json();
    console.log("Payload recibido de Telegram:", JSON.stringify(payload));

    const message = payload.message;
    
    // Ignorar si no es un mensaje de texto normal
    if (!message || !message.text) {
      return new Response("OK", { status: 200 });
    }

    const update_id = payload.update_id?.toString();
    const chat_id = message.chat?.id?.toString();
    const from_id = message.from?.id?.toString();
    const from_username = message.from?.username;
    const text = message.text;

    // 2. Guardar log crudo en base de datos
    const { error: dbError } = await supabase.from("telegram_logs").insert({
      telegram_update_id: update_id,
      telegram_chat_id: chat_id,
      telegram_user_id: from_id,
      telegram_username: from_username,
      message_text: text,
      raw_payload: payload
    });

    if (dbError) {
      console.error("Error guardando en telegram_logs:", dbError);
      // No lanzamos error para devolver 200 a Telegram de todas formas
    }

    // 3. Enviar mensaje de respuesta (eco simple temporal) a Telegram
    if (TELEGRAM_BOT_TOKEN && chat_id) {
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chat_id,
          text: "✅ Recibido en Quantum Life Manager",
        }),
      });
    }

    // 4. Devolver siempre 200 rápidamente a Meta/Telegram para que no re-envíen el webhook
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error crítico en telegram-webhook:", error);
    // Devolver 200 incluso en catch general para evitar reintentos de Telegram en caso de payloads corruptos
    return new Response("Error procesado", { status: 200 });
  }
});
