-- ============================================================
-- PROPUESTA DE CRON: PUSH-5
-- IMPORTANTE: NO EJECUTAR ESTO hasta validar manualmente process-reminders.
-- ============================================================

-- 1. Habilitar la extensión pg_cron (y opcionalmente pg_net) si no están habilitadas.
-- En los proyectos de Supabase modernos ya suelen venir habilitadas o se activan desde el Dashboard (Database > Extensions).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Crear un schedule para que llame a process-reminders cada 1 minuto.
-- Reemplaza tu URL y el Bearer token (Service Role Key o Anon Key)
/*
SELECT cron.schedule(
    'process-reminders-job',
    '* * * * *',
    $$
    select net.http_post(
        url:='https://<TU_PROJECT_REF>.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <TU_ANON_KEY_O_SERVICE_ROLE_KEY>"}'::jsonb
    );
    $$
);
*/

-- Para detener el cron job si algo sale mal:
-- SELECT cron.unschedule('process-reminders-job');
