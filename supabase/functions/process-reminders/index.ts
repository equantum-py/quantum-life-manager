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
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("[Process Reminders] VAPID keys missing in env");
      return new Response(JSON.stringify({ error: "VAPID keys not configured in server" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch pending reminders
    const { data: reminders, error: fetchError } = await supabase
      .from("reminders")
      .select("*")
      .eq("status", "pending")
      .lte("remind_at", new Date().toISOString())
      .limit(20);

    if (fetchError || !reminders) {
      console.error("[Process Reminders] Error fetching reminders", fetchError);
      return new Response(JSON.stringify({ error: "Error fetching reminders" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    if (reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No pending reminders to process", processed: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    console.log(`[Process Reminders] Found ${reminders.length} pending reminders to process.`);

    let sentCount = 0;
    let failedCount = 0;

    for (const reminder of reminders) {
      const { user_id, id, title } = reminder;

      // Buscar suscripciones activas
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", true);

      if (subError || !subscriptions || subscriptions.length === 0) {
        // No hay suscripciones, marcamos como sent igual para no reintentar infinitamente o failed?
        // El usuario dijo: "Si falla: actualizar reminder a failed". Sin sub = failed.
        await supabase.from("reminders").update({
          status: "failed",
          metadata: { ...reminder.metadata, error: "No active subscriptions found", failed_at: new Date().toISOString() }
        }).eq("id", id);
        failedCount++;
        continue;
      }

      const pushPayload = JSON.stringify({
        title: "Recordatorio",
        body: title,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        url: "/alerts"
      });

      let sentForThisReminder = false;
      let lastError = "";

      for (const sub of subscriptions) {
        if (!sub.p256dh || !sub.auth) continue;

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        };

        try {
          await webpush.sendNotification(pushSubscription, pushPayload);
          sentForThisReminder = true;
        } catch (err: any) {
          lastError = err?.message || 'Push provider error';
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await supabase.from("push_subscriptions").update({ is_active: false }).eq("id", sub.id);
          }
        }
      }

      if (sentForThisReminder) {
        await supabase.from("reminders").update({
          status: "sent",
          sent_at: new Date().toISOString()
        }).eq("id", id);
        sentCount++;
      } else {
        await supabase.from("reminders").update({
          status: "failed",
          metadata: { ...reminder.metadata, error: lastError || "All subscriptions failed", failed_at: new Date().toISOString() }
        }).eq("id", id);
        failedCount++;
      }
    }

    return new Response(JSON.stringify({ 
      message: "Reminders processed", 
      total: reminders.length, 
      sent: sentCount, 
      failed: failedCount 
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("[Process Reminders] Critical Error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
