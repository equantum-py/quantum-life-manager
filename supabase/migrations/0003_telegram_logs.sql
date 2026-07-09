-- Create telegram_logs table to audit incoming messages from the Telegram Bot
CREATE TABLE public.telegram_logs (
    id uuid primary key default gen_random_uuid(),
    telegram_update_id text unique,
    telegram_chat_id text not null,
    telegram_user_id text,
    telegram_username text,
    message_text text not null,
    raw_payload jsonb,
    ai_raw_response jsonb,
    created_at timestamptz default now()
);

-- Turn on Row Level Security
ALTER TABLE public.telegram_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access only to authenticated users (admin visualization later)
CREATE POLICY "Allow authenticated users to read telegram_logs"
ON public.telegram_logs FOR SELECT
TO authenticated
USING (true);

-- The Edge Function will use the Service Role Key to insert, bypassing RLS, 
-- but we could optionally add an insert policy if needed. 
