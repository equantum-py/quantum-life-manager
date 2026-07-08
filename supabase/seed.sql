-- ==============================================================================
-- 1. SECTIONS (Áreas Vitales)
-- ==============================================================================
INSERT INTO public.sections (id, name, description, color, icon) VALUES
('familia', 'Familia Derlis & Gabriela', 'Administración del hogar, finanzas familiares, salud y planes a futuro.', 'rose', 'Heart'),
('iglesia', 'Iglesia', 'Liderazgo, predicaciones, eventos y reuniones de la congregación.', 'amber', 'Church'),
('inverfin', 'Inverfin', 'Proyectos laborales, métricas de rendimiento y reuniones corporativas.', 'blue', 'Briefcase'),
('equantum', 'eQuantum', 'Desarrollo de software, clientes, cotizaciones y entregas.', 'violet', 'Rocket'),
('idear', 'IDEAR', 'Estudios teológicos, tareas académicas y lectura.', 'emerald', 'BookOpen')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. eQUANTUM PROJECTS (Mock Data Inicial)
-- ==============================================================================
INSERT INTO public.projects (name, client, status, priority, start_date, due_date, pending_tasks, notes, section_id) VALUES
('GuaraMarket', 'GuaraMarket S.A.', 'En desarrollo', 'Alta', CURRENT_DATE, CURRENT_DATE + interval '30 days', 12, 'Integración de pasarela de pagos pendiente.', 'equantum'),
('Corpicia', 'Corpicia C.A.', 'En diseño', 'Media', CURRENT_DATE, CURRENT_DATE + interval '45 days', 5, 'Aprobación de wireframes requerida.', 'equantum'),
('Marmolería Pietra', 'Pietra S.R.L', 'Terminado', 'Baja', CURRENT_DATE - interval '60 days', CURRENT_DATE - interval '10 days', 0, 'Entregado y cobrado.', 'equantum'),
('Cooperativa Vida & Luz', 'Vida & Luz', 'En análisis', 'Media', CURRENT_DATE, CURRENT_DATE + interval '90 days', 2, 'Recopilando requerimientos del sistema de socios.', 'equantum'),
('Joyerialis', 'Joyerialis', 'Pausado', 'Baja', CURRENT_DATE, CURRENT_DATE + interval '120 days', 8, 'El cliente solicitó congelar por 1 mes.', 'equantum'),
('Portal Cooperativo', 'Varios', 'Esperando cliente', 'Alta', CURRENT_DATE, CURRENT_DATE + interval '15 days', 1, 'Esperando feedback de la versión 1.2.', 'equantum'),
('Portfolio personal', 'Interno', 'Nuevo', 'Baja', CURRENT_DATE, CURRENT_DATE + interval '60 days', 10, 'Actualizar con proyectos de 2026.', 'equantum');

-- ==============================================================================
-- 3. USERS, PROFILES & SECTION MEMBERS (Instrucciones)
-- ==============================================================================
/* 
¡ATENCIÓN!
No se pueden insertar usuarios directamente en `public.profiles` si no existen primero en `auth.users` (que es gestionado internamente por Supabase Auth).

PASOS PARA CREAR LOS USUARIOS REALES UNA VEZ INICIADO SUPABASE:

1. Ve al dashboard de Supabase -> Authentication -> Add User.
2. Crea los tres usuarios:
   - Derlis (admin)
   - Daniel (colaborador)
   - Gabriela (family)
   
3. Copia el UUID generado para cada uno y corre este SQL manualmente:

-- Insertar Perfiles
INSERT INTO public.profiles (id, name, email, role) VALUES 
('<UUID-DERLIS>', 'Derlis Aguilera', 'derlis@email.com', 'admin'),
('<UUID-DANIEL>', 'Daniel Sosa', 'daniel@email.com', 'collaborator'),
('<UUID-GABRIELA>', 'Gabriela', 'gabriela@email.com', 'family');

-- Asignar Accesos a Secciones (Memberships)
INSERT INTO public.section_members (user_id, section_id) VALUES
('<UUID-DANIEL>', 'equantum'),
('<UUID-GABRIELA>', 'familia');

-- Nota: Derlis no necesita estar en section_members porque su rol es 'admin', 
-- lo que le da acceso global mediante las políticas RLS.
*/
