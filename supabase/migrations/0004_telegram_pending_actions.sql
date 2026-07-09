-- Create telegram_pending_actions table for manual confirmation flow
CREATE TABLE public.telegram_pending_actions (
    id uuid primary key default gen_random_uuid(),
    telegram_chat_id text not null,
    telegram_user_id text,
    action_type text not null,
    status text not null default 'pending',
    classification_id uuid null,
    telegram_log_id uuid null references public.telegram_logs(id) on delete set null,
    payload jsonb not null,
    created_at timestamptz default now(),
    confirmed_at timestamptz null,
    cancelled_at timestamptz null
);

-- Create indexes for quick lookups during CREAR/CANCELAR
CREATE INDEX idx_telegram_pending_chat_status_created ON public.telegram_pending_actions(telegram_chat_id, status, created_at desc);

-- Turn on Row Level Security
ALTER TABLE public.telegram_pending_actions ENABLE ROW LEVEL SECURITY;

-- Allow read access only to authenticated users (admin visualization)
CREATE POLICY "Allow authenticated users to read telegram_pending_actions"
ON public.telegram_pending_actions FOR SELECT
TO authenticated
USING (true);

-- The Edge Function uses Service Role Key to insert/update, bypassing RLS.
