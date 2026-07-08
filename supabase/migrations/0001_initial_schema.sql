-- 1. Enum Types (Match frontend types)
CREATE TYPE user_role AS ENUM ('admin', 'collaborator', 'family');
CREATE TYPE task_status AS ENUM ('Pendiente', 'En progreso', 'En revisión', 'Bloqueada', 'Terminada', 'Vencida');
CREATE TYPE priority_level AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');
CREATE TYPE meeting_type AS ENUM ('Reunión', 'Entrega', 'Evento', 'Recordatorio', 'Actividad', 'Clase', 'Llamada');
CREATE TYPE project_status AS ENUM ('Nuevo', 'En análisis', 'En diseño', 'En desarrollo', 'En revisión', 'Esperando cliente', 'Pausado', 'Terminado', 'Cobrado', 'Cancelado');

-- 2. Sections Table
CREATE TABLE public.sections (
    id TEXT PRIMARY KEY, -- 'familia', 'iglesia', 'inverfin', 'equantum', 'idear'
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'collaborator'::user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Section Members (Many-to-Many access control)
CREATE TABLE public.section_members (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, section_id)
);

-- 5. Tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    project_id TEXT, -- Will link to projects table later or text if loosely coupled
    client TEXT,
    priority priority_level DEFAULT 'Media'::priority_level,
    status task_status DEFAULT 'Pendiente'::task_status,
    due_date TIMESTAMPTZ,
    assignee TEXT,
    reminder TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Meetings / Events
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    type meeting_type DEFAULT 'Reunión'::meeting_type,
    reminder TEXT,
    participants JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Agendado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notes
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    category TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    status project_status DEFAULT 'Nuevo'::project_status,
    priority priority_level DEFAULT 'Media'::priority_level,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    pending_tasks INTEGER DEFAULT 0,
    notes TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    payment_status TEXT DEFAULT 'Pendiente',
    section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE DEFAULT 'equantum',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WhatsApp Logs
CREATE TABLE public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_sid TEXT UNIQUE NOT NULL,
    body TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    ai_raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI Classifications
CREATE TABLE public.ai_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_log_id UUID NOT NULL REFERENCES public.whatsapp_logs(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    item_type TEXT NOT NULL,
    section_id TEXT REFERENCES public.sections(id) ON DELETE SET NULL,
    confidence NUMERIC NOT NULL,
    reasoning TEXT,
    extracted_data JSONB NOT NULL,
    is_ambiguous BOOLEAN DEFAULT false,
    suggested_clarification_question TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notes_modtime BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
