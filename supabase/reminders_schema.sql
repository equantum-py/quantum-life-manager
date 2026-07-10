-- ============================================================
-- SCRIPT DE IMPLEMENTACIÓN: RECORDATORIOS INTERNOS (REM-2)
-- IMPORTANTE: EJECUTAR MANUALMENTE EN EL SQL EDITOR DE SUPABASE.
-- ============================================================

-- 1. Tabla de Recordatorios
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('task', 'meeting', 'custom')),
    source_id UUID,
    title TEXT NOT NULL,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'app' CHECK (channel IN ('app', 'telegram', 'push')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_reminders_status_remind_at ON public.reminders(status, remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_source ON public.reminders(source_type, source_id);

-- 3. Habilitar RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS seguras
-- Ver propios recordatorios
CREATE POLICY "Users can view their own reminders" 
ON public.reminders FOR SELECT 
USING (auth.uid() = user_id);

-- Crear propios recordatorios
CREATE POLICY "Users can insert their own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Actualizar propios recordatorios
CREATE POLICY "Users can update their own reminders" 
ON public.reminders FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Eliminar propios recordatorios
CREATE POLICY "Users can delete their own reminders" 
ON public.reminders FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Trigger updated_at
-- Supone que la función moddatetime existe (extensión común de supabase).
-- Si no existe, crear: CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;
DROP TRIGGER IF EXISTS handle_reminders_updated_at ON public.reminders;
CREATE TRIGGER handle_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

