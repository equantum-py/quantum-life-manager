-- ============================================================
-- PROPUESTA DE ESQUEMA: RECORDATORIOS INTERNOS (REM-1)
-- IMPORTANTE: NO EJECUTAR. Es solo una propuesta de esquema.
-- ============================================================

-- 1. Tabla de Recordatorios
/*
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('task', 'meeting', 'custom')),
    source_id UUID NOT NULL, -- No es FK estricta para soportar múltiples tablas
    title TEXT NOT NULL,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'app' CHECK (channel IN ('app', 'telegram', 'push', 'all')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices de rendimiento para el Cron Job
CREATE INDEX idx_reminders_status_remind_at ON public.reminders(status, remind_at);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_source ON public.reminders(source_type, source_id);

-- Habilitar RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders" 
ON public.reminders FOR ALL 
USING (auth.uid() = user_id);
*/

-- 2. Trigger para actualizar el updated_at (Opcional pero recomendado)
/*
CREATE TRIGGER handle_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
*/
