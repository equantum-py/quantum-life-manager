-- ==========================================
-- SCRIPT MANUAL DE CONFIGURACIÓN DE PERFILES
-- ==========================================
-- INSTRUCCIONES:
-- 1. Ve a "Authentication" -> "Users" en Supabase.
-- 2. Copia los UUIDs generados para cada usuario.
-- 3. Reemplaza los strings '[UUID_DERLIS]', '[UUID_DANIEL]' y '[UUID_GABRIELA]' abajo.
-- 4. Ejecuta este script en el SQL Editor.

/* 
-- DESCOMENTAR PARA EJECUTAR:

-- 1. Insertar Perfiles
INSERT INTO profiles (id, name, role) VALUES 
  ('[UUID_DERLIS]', 'Derlis Aguilera', 'admin'),
  ('[UUID_DANIEL]', 'Daniel Sosa', 'collaborator'),
  ('[UUID_GABRIELA]', 'Gabriela', 'family');

-- 2. Insertar Permisos de Sección (section_members)

-- Permisos de Daniel (Solo eQuantum)
INSERT INTO section_members (user_id, section_id) VALUES 
  ('[UUID_DANIEL]', 'equantum');

-- Permisos de Gabriela (Solo Familia)
INSERT INTO section_members (user_id, section_id) VALUES 
  ('[UUID_GABRIELA]', 'familia');

-- Permisos de Derlis (Todos)
INSERT INTO section_members (user_id, section_id) VALUES 
  ('[UUID_DERLIS]', 'equantum'),
  ('[UUID_DERLIS]', 'familia'),
  ('[UUID_DERLIS]', 'iglesia'),
  ('[UUID_DERLIS]', 'inverfin'),
  ('[UUID_DERLIS]', 'idear');
*/
