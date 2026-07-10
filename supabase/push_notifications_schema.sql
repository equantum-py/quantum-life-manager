-- ============================================================
-- PROPUESTA DE ESQUEMA: PUSH NOTIFICATIONS (PUSH-1)
-- IMPORTANTE: NO EJECUTAR. Es solo una propuesta de esquema.
-- ============================================================

-- 1. Tabla de Suscripciones (Endpoints generados por el Service Worker)
/*
CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    device_label TEXT DEFAULT 'Desconocido',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (auth.uid() = user_id);
*/

-- 2. Tabla de Logs (Opcional, para debuggear entregas fallidas o exitosas)
/*
CREATE TABLE public.push_notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_id UUID, -- Referencia a la tabla reminders, si aplica
    title TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.push_notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own push logs" ON public.push_notification_logs FOR SELECT USING (auth.uid() = user_id);
*/
