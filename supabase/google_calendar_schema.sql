-- ============================================================
-- PROPUESTA DE ESQUEMA: GOOGLE CALENDAR (CAL-1)
-- IMPORTANTE: NO EJECUTAR. Es solo una propuesta de esquema.
-- Requiere evaluación de seguridad para encriptación de tokens.
-- ============================================================

-- 1. Tabla de Conexiones de Google Calendar
/*
CREATE TABLE public.google_calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    -- Peligro: Si no usas Supabase Vault, guardar tokens en texto plano es inseguro.
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections" 
ON public.google_calendar_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own connections" 
ON public.google_calendar_connections FOR ALL 
USING (auth.uid() = user_id);
*/

-- 2. Modificaciones a la tabla Meetings
/*
ALTER TABLE public.meetings
ADD COLUMN google_event_id TEXT,
ADD COLUMN google_calendar_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN google_calendar_sync_status TEXT DEFAULT 'pending'; -- 'pending', 'synced', 'failed'
*/
