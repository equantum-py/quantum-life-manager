import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      return new Response(JSON.stringify({ error: "Missing Google OAuth config (Client ID or Redirect URI)" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    let userId = "9a154a6a-a30c-4657-9b0b-11b7cc1b303d"; // Hardcoded a Derlis temporalmente por regla de negocio
    
    try {
      const payload = await req.json();
      if (payload.user_id) userId = payload.user_id;
    } catch (e) {
      // Si es GET o body vacío, no pasa nada, se usa el default.
    }

    const scope = "https://www.googleapis.com/auth/calendar.events";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${userId}`;

    return new Response(JSON.stringify({ url: authUrl }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("[Google Auth] Error generating url:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
