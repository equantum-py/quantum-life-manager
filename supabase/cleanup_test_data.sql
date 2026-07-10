-- ==========================================
-- SCRIPT DE LIMPIEZA (DESTRUCTIVO)
-- ==========================================
-- IMPORTANTE: NO ejecutar masivamente este archivo.
-- Todo está comentado por seguridad. 
-- Descomenta solo los bloques que hayas validado usando cleanup_audit.sql.

-- ==========================================
-- 1. LIMPIEZA DE NOTAS
-- ==========================================
-- Primero revisar:
-- SELECT id, title, content, created_at FROM public.notes WHERE title ILIKE '%Bristol%' OR content ILIKE '%Bristol%' OR title ILIKE '%FORTIS%' OR title ILIKE '%supermercado%' OR title ILIKE '%GuaraMarket%' OR title ILIKE '%prueba%' OR title ILIKE '%test%';

-- Solo después de confirmar:
-- DELETE FROM public.notes
-- WHERE title ILIKE '%Bristol%' OR content ILIKE '%Bristol%'
--    OR title ILIKE '%FORTIS%' OR content ILIKE '%FORTIS%'
--    OR title ILIKE '%supermercado%' OR content ILIKE '%supermercado%'
--    OR title ILIKE '%GuaraMarket%' OR content ILIKE '%GuaraMarket%'
--    OR title ILIKE '%prueba%' OR content ILIKE '%prueba%'
--    OR title ILIKE '%test%' OR content ILIKE '%test%';


-- ==========================================
-- 2. LIMPIEZA DE TAREAS
-- ==========================================
-- Primero revisar:
-- SELECT id, title, created_at FROM public.tasks WHERE title ILIKE '%Bristol%' OR title ILIKE '%FORTIS%' OR title ILIKE '%supermercado%' OR title ILIKE '%GuaraMarket%' OR title ILIKE '%prueba%' OR title ILIKE '%test%';

-- Solo después de confirmar:
-- DELETE FROM public.tasks
-- WHERE title ILIKE '%Bristol%' OR description ILIKE '%Bristol%'
--    OR title ILIKE '%FORTIS%' OR description ILIKE '%FORTIS%'
--    OR title ILIKE '%supermercado%' OR description ILIKE '%supermercado%'
--    OR title ILIKE '%GuaraMarket%' OR description ILIKE '%GuaraMarket%'
--    OR title ILIKE '%prueba%' OR description ILIKE '%prueba%'
--    OR title ILIKE '%test%' OR description ILIKE '%test%';


-- ==========================================
-- 3. LIMPIEZA DE REUNIONES
-- ==========================================
-- Primero revisar:
-- SELECT id, title, date, created_at FROM public.meetings WHERE title ILIKE '%Bristol%' OR title ILIKE '%FORTIS%' OR title ILIKE '%supermercado%' OR title ILIKE '%GuaraMarket%' OR title ILIKE '%prueba%' OR title ILIKE '%test%';

-- Solo después de confirmar:
-- DELETE FROM public.meetings
-- WHERE title ILIKE '%Bristol%' OR description ILIKE '%Bristol%'
--    OR title ILIKE '%FORTIS%' OR description ILIKE '%FORTIS%'
--    OR title ILIKE '%supermercado%' OR description ILIKE '%supermercado%'
--    OR title ILIKE '%GuaraMarket%' OR description ILIKE '%GuaraMarket%'
--    OR title ILIKE '%prueba%' OR description ILIKE '%prueba%'
--    OR title ILIKE '%test%' OR description ILIKE '%test%';


-- ==========================================
-- 4. LIMPIEZA DE TELEGRAM PENDING ACTIONS
-- ==========================================
-- Primero revisar:
-- SELECT id, action_type, status, created_at FROM public.telegram_pending_actions WHERE created_at < 'YYYY-MM-DD';

-- Solo después de confirmar (OJO CON LAS CLAVES FORÁNEAS DE OTRAS TABLAS):
-- DELETE FROM public.telegram_pending_actions
-- WHERE created_at < 'YYYY-MM-DD'
--    OR (payload->>'title') ILIKE '%Bristol%'
--    OR (payload->>'title') ILIKE '%FORTIS%'
--    OR (payload->>'title') ILIKE '%supermercado%'
--    OR (payload->>'title') ILIKE '%prueba%'
--    OR (payload->>'title') ILIKE '%test%';


-- ==========================================
-- 5. LIMPIEZA DE TELEGRAM LOGS Y AI CLASSIFICATIONS
-- ==========================================
-- Para limpiar registros técnicos y purgar la base de datos de auditoría de desarrollo.
-- Es recomendable borrar primero de tablas "hijas" como pending_actions antes de los logs si hay FK restrictivas.

-- DELETE FROM public.telegram_logs
-- WHERE message_text ILIKE '%prueba%' 
--    OR message_text ILIKE '%test%'
--    OR message_text ILIKE '%Bristol%'
--    OR message_text ILIKE '%FORTIS%'
--    OR created_at < 'YYYY-MM-DD';

-- DELETE FROM public.ai_classifications
-- WHERE original_text ILIKE '%prueba%' 
--    OR original_text ILIKE '%test%'
--    OR original_text ILIKE '%Bristol%'
--    OR original_text ILIKE '%FORTIS%'
--    OR created_at < 'YYYY-MM-DD';
