-- ============================================================
-- SQL DE PREPARACIÓN PARA GOOGLE CALENDAR (CAL-2)
-- ============================================================

-- Tabla para almacenar los tokens OAuth de los usuarios de manera segura
CREATE TABLE public.google_calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    google_email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_type TEXT,
    scope TEXT,
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar seguridad a nivel de filas (RLS)
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Un usuario solo puede ver y modificar su propia conexión
CREATE POLICY "Users can manage their own calendar connections"
    ON public.google_calendar_connections
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Comentario
COMMENT ON TABLE public.google_calendar_connections IS 'Almacena credenciales OAuth2 de Google Calendar por usuario. Los tokens deben ser utilizados exclusivamente desde Edge Functions seguras.';
