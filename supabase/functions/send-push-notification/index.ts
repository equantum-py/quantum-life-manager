import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:contacto@equantum.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const payload = await req.json();
    const { user_id, title, body, url = "/alerts" } = payload;

    if (!user_id || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields (user_id, title, body)" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured in server" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    console.log("[Push] VAPID Config:", {
      hasPublicKey: !!VAPID_PUBLIC_KEY,
      publicKeyLength: VAPID_PUBLIC_KEY.length,
      hasPrivateKey: !!VAPID_PRIVATE_KEY,
      privateKeyLength: VAPID_PRIVATE_KEY.length,
      subject: VAPID_SUBJECT
    });

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (subError || !subscriptions) {
      return new Response(JSON.stringify({ error: "Error fetching subscriptions" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    if (subscriptions.length === 0) {
      console.log(`[Push] No active subscriptions found for user: ${user_id}`);
      return new Response(JSON.stringify({ message: "No active subscriptions found for user", sent: 0, failed: 0, disabled: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    console.log(`[Push] Found ${subscriptions.length} active subscription(s) for user: ${user_id}`);

    const pushPayload = JSON.stringify({
      title,
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      url
    });

    let sent = 0;
    let failed = 0;
    let disabled = 0;

    for (const sub of subscriptions) {
      if (!sub.p256dh || !sub.auth) {
        console.error(`[Push] Subscription keys missing for sub ID: ${sub.id}`);
        failed++;
        continue;
      }

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        const urlObj = new URL(sub.endpoint);
        console.log(`[Push] Attempting send to host: ${urlObj.hostname}`);
        
        await webpush.sendNotification(pushSubscription, pushPayload);
        console.log(`[Push] Successfully sent to host: ${urlObj.hostname}`);
        sent++;
        
        // Log de éxito (silencioso si falla la tabla)
        await supabase.from("push_notification_logs").insert({
          user_id, title, body, status: 'sent'
        });
      } catch (err: any) {
        failed++;
        console.error("[Push] Send failed", {
          name: err?.name,
          statusCode: err?.statusCode,
          message: err?.message,
          body: err?.body
        });
        
        // Si el endpoint expiró o fue desuscripto
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          console.log(`[Push] Marking subscription ${sub.id} as inactive (404/410)`);
          await supabase.from("push_subscriptions").update({ is_active: false }).eq("id", sub.id);
          disabled++;
        }
        
        // Log de fallo
        await supabase.from("push_notification_logs").insert({
          user_id, title, body, status: 'failed', error_message: err?.message || 'Unknown error'
        });
      }
    }

    return new Response(JSON.stringify({ message: "Push process completed", sent, failed, disabled }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Critical error in send-push-notification:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
