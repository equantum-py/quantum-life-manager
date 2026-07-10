-- ==========================================
-- SCRIPT DE AUDITORÍA (SOLO LECTURA)
-- ==========================================
-- Ejecuta este script en el SQL Editor de Supabase para revisar qué datos
-- están marcados como potenciales pruebas. NO borra nada.

-- 1. Notas de Prueba
SELECT id, title, content, section_id, created_at 
FROM public.notes
WHERE title ILIKE '%Bristol%' OR content ILIKE '%Bristol%'
   OR title ILIKE '%FORTIS%' OR content ILIKE '%FORTIS%'
   OR title ILIKE '%supermercado%' OR content ILIKE '%supermercado%'
   OR title ILIKE '%GuaraMarket%' OR content ILIKE '%GuaraMarket%'
   OR title ILIKE '%prueba%' OR content ILIKE '%prueba%'
   OR title ILIKE '%test%' OR content ILIKE '%test%';

-- 2. Tareas de Prueba
SELECT id, title, description, section_id, created_at 
FROM public.tasks
WHERE title ILIKE '%Bristol%' OR description ILIKE '%Bristol%'
   OR title ILIKE '%FORTIS%' OR description ILIKE '%FORTIS%'
   OR title ILIKE '%supermercado%' OR description ILIKE '%supermercado%'
   OR title ILIKE '%GuaraMarket%' OR description ILIKE '%GuaraMarket%'
   OR title ILIKE '%prueba%' OR description ILIKE '%prueba%'
   OR title ILIKE '%test%' OR description ILIKE '%test%';

-- 3. Reuniones/Agenda de Prueba
SELECT id, title, description, date, section_id, created_at 
FROM public.meetings
WHERE title ILIKE '%Bristol%' OR description ILIKE '%Bristol%'
   OR title ILIKE '%FORTIS%' OR description ILIKE '%FORTIS%'
   OR title ILIKE '%supermercado%' OR description ILIKE '%supermercado%'
   OR title ILIKE '%GuaraMarket%' OR description ILIKE '%GuaraMarket%'
   OR title ILIKE '%prueba%' OR description ILIKE '%prueba%'
   OR title ILIKE '%test%' OR description ILIKE '%test%';

-- 4. Telegram Pending Actions de Prueba o Antiguas
SELECT id, action_type, status, payload, created_at 
FROM public.telegram_pending_actions
WHERE created_at < 'YYYY-MM-DD' -- [PLACEHOLDER] Reemplazar por fecha de pase a producción
   OR (payload->>'title') ILIKE '%Bristol%'
   OR (payload->>'title') ILIKE '%FORTIS%'
   OR (payload->>'title') ILIKE '%supermercado%'
   OR (payload->>'title') ILIKE '%prueba%'
   OR (payload->>'title') ILIKE '%test%';

-- 5. Telegram Logs de Prueba o Antiguos
SELECT id, telegram_update_id, message_text, created_at 
FROM public.telegram_logs
WHERE message_text ILIKE '%prueba%' 
   OR message_text ILIKE '%test%'
   OR message_text ILIKE '%Bristol%'
   OR message_text ILIKE '%FORTIS%'
   OR message_text ILIKE '%Detecté%'
   OR message_text ILIKE '%Señor, entendí el pedido%' -- Mensajes duplicados generados por errores de bot
   OR created_at < 'YYYY-MM-DD'; -- [PLACEHOLDER] Reemplazar por fecha de pase a producción

-- 6. AI Classifications (y Whatsapp Logs si se usó)
SELECT id, original_text, reasoning, created_at 
FROM public.ai_classifications
WHERE original_text ILIKE '%prueba%' 
   OR original_text ILIKE '%test%'
   OR original_text ILIKE '%Bristol%'
   OR original_text ILIKE '%FORTIS%'
   OR created_at < 'YYYY-MM-DD'; -- [PLACEHOLDER]
