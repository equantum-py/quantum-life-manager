import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const GOOGLE_REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Contiene el user_id

    if (!code || !state) {
      return new Response("Missing code or state in callback", { status: 400 });
    }

    console.log(`[Google Callback] Intercambiando code por tokens para user: ${state}`);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("[Google Callback] Token exchange error:", tokenData);
      return new Response("Error al obtener los tokens de Google.", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    const updatePayload: any = {
      user_id: state,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expiry_date: expiryDate,
      updated_at: new Date().toISOString(),
      is_active: true
    };

    // Google solo envía refresh_token la primera vez o si forzamos prompt=consent
    if (tokenData.refresh_token) {
      updatePayload.refresh_token = tokenData.refresh_token;
    }

    const { error: dbError } = await supabase.from("google_calendar_connections").upsert(updatePayload, { onConflict: "user_id" });

    if (dbError) {
      console.error("[Google Callback] Database error:", dbError);
      return new Response("Error al guardar la conexión en la base de datos.", { status: 500 });
    }

    return new Response(`
      <html>
        <head>
          <title>Conexión Exitosa</title>
          <style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a1a; color: white; text-align: center; }</style>
        </head>
        <body>
          <div>
            <h1>¡Conexión Exitosa! 🎉</h1>
            <p>Quantum Life Manager ya está conectado a tu Google Calendar.</p>
            <p style="color: #888;">Ya puedes cerrar esta ventana y volver a la app.</p>
          </div>
        </body>
      </html>
    `, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });

  } catch (error: any) {
    console.error("[Google Callback] Critical Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
