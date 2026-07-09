-- ==========================================
-- SCRIPT DE VALIDACIÓN SUPABASE
-- ==========================================
-- Ejecuta estas consultas en el SQL Editor de Supabase para validar la migración.

-- 1. Validar Secciones Creadas
SELECT id, name FROM sections;

-- 2. Validar Proyectos Creados
SELECT id, title, section_id FROM projects;

-- 3. Validar Profiles Creados
SELECT id, email, name, role FROM profiles;

-- 4. Validar Permisos (section_members)
SELECT p.name AS usuario, s.name AS seccion
FROM section_members sm
JOIN profiles p ON sm.user_id = p.id
JOIN sections s ON sm.section_id = s.id;

-- 5. Validar Tareas (Crear una tarea manual o vía app y ejecutar)
SELECT id, title, section_id, status FROM tasks;

-- 6. Validar Reuniones (Agenda)
SELECT id, title, section_id, date, start_time FROM meetings;

-- 7. Validar Notas
SELECT id, title, section_id, category FROM notes;

-- 8. Validar logs de WhatsApp
SELECT id, from_number, message_body, status, created_at FROM whatsapp_logs;

-- 9. Validar Clasificaciones de IA
SELECT id, message_id, intent_type, section_id, confidence, applied FROM ai_classifications;
