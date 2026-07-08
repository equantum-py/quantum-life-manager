-- Habilitar Row Level Security en todas las tablas públicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_classifications ENABLE ROW LEVEL SECURITY;

-- Funciones de ayuda para determinar si el usuario es Admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- 1. Profiles (Solo el propio usuario puede leer/editar su perfil, los admins todo)
-- ==============================================================================
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin());

-- ==============================================================================
-- 2. Sections (Todos pueden leer, solo admins pueden modificar)
-- ==============================================================================
CREATE POLICY "Anyone can view sections"
    ON public.sections FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify sections"
    ON public.sections FOR ALL
    USING (is_admin());

-- ==============================================================================
-- 3. Section Members (Control interno)
-- ==============================================================================
CREATE POLICY "Users can see their own section memberships"
    ON public.section_members FOR SELECT
    USING (auth.uid() = user_id OR is_admin());

-- ==============================================================================
-- 4. Entidades por Sección (Tasks, Meetings, Notes, Projects, AI Classifications)
-- Las políticas son idénticas: Acceso si es Admin, o si es miembro de la sección.
-- ==============================================================================

-- Tasks
CREATE POLICY "Access tasks by section membership or admin"
    ON public.tasks FOR ALL
    USING (
        is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.section_members sm 
            WHERE sm.user_id = auth.uid() AND sm.section_id = tasks.section_id
        )
    );

-- Meetings
CREATE POLICY "Access meetings by section membership or admin"
    ON public.meetings FOR ALL
    USING (
        is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.section_members sm 
            WHERE sm.user_id = auth.uid() AND sm.section_id = meetings.section_id
        )
    );

-- Notes
CREATE POLICY "Access notes by section membership or admin"
    ON public.notes FOR ALL
    USING (
        is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.section_members sm 
            WHERE sm.user_id = auth.uid() AND sm.section_id = notes.section_id
        )
    );

-- Projects
CREATE POLICY "Access projects by section membership or admin"
    ON public.projects FOR ALL
    USING (
        is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.section_members sm 
            WHERE sm.user_id = auth.uid() AND sm.section_id = projects.section_id
        )
    );

-- AI Classifications (Mismo criterio)
CREATE POLICY "Access ai classifications by section membership or admin"
    ON public.ai_classifications FOR ALL
    USING (
        is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.section_members sm 
            WHERE sm.user_id = auth.uid() AND sm.section_id = ai_classifications.section_id
        )
    );

-- WhatsApp Logs (Auditoría global)
-- Solo los admins tienen acceso a los logs crudos.
CREATE POLICY "Only admins can access raw whatsapp logs"
    ON public.whatsapp_logs FOR ALL
    USING (is_admin());
