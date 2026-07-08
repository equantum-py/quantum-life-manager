# Supabase Local Setup & Migrations

Este directorio contiene la arquitectura de la base de datos de Quantum Life Manager para Supabase.

## Archivos de Migración

1. **`migrations/0001_initial_schema.sql`**
   - Crea las tablas fundamentales (`profiles`, `sections`, `section_members`, `tasks`, `meetings`, `notes`, `projects`, `whatsapp_logs`, `ai_classifications`).
   - Define Enums de PostgreSQL para proteger la integridad de los datos.
   - Crea las llaves foráneas (`ON DELETE CASCADE`) y los Triggers para automatizar `updated_at`.

2. **`migrations/0002_rls_policies.sql`**
   - Habilita RLS (Row Level Security).
   - Crea políticas de seguridad críticas para el manejo multitenant (por áreas):
     - Administradores (Derlis) tienen acceso omnipotente.
     - Colaboradores (Daniel) están restringidos matemáticamente a `eQuantum`.
     - Familiares (Gabriela) restringidas a `Familia`.

3. **`seed.sql`**
   - Script de población inicial.
   - Inserta las 5 áreas vitales fundamentales que usa la app.
   - Inserta los proyectos *mock* estáticos de eQuantum para empezar a probar.

## Orden de Ejecución
Si estás levantando la base de datos manualmente en el SQL Editor de Supabase (y no usando el CLI), **debes ejecutar los scripts estrictamente en este orden**:
1. `0001_initial_schema.sql`
2. `0002_rls_policies.sql`
3. `seed.sql`

## Usuarios y Autenticación (Supabase Auth)
Los perfiles de usuario (`public.profiles`) tienen una llave foránea restrictiva hacia `auth.users` (el esquema cerrado de Supabase). 
Por lo tanto, el `seed.sql` **no** crea los usuarios automáticamente. 
Debes crearlos manualmente en el Dashboard de Supabase y luego enlazar sus UUIDs. Las instrucciones precisas (con código SQL preparado) están al final del propio archivo `seed.sql`.

## Estrategia VITE_DATA_MODE
La app soporta dos modos que conviven en paz:
- `VITE_DATA_MODE=mock`: Lee todo desde `localStorage` (sin base de datos, perfecto para UI/UX y demostraciones rápidas).
- `VITE_DATA_MODE=supabase`: La app intentará usar `VITE_SUPABASE_URL` y la Anon Key para hacer consultas REST/Realtime directamente a PostgreSQL.

Las políticas **RLS** descritas arriba garantizan que cuando uses el modo `supabase`, un cliente malicioso con la *Anon Key* no pueda ver los datos personales de la familia, a menos que esté logueado y tenga permisos en `section_members`.

## Pendiente antes de Producción
1. Refactorizar los servicios (`src/services/*`) para que obedezcan al feature toggle y utilicen `@supabase/supabase-js`.
2. Habilitar y probar Supabase Auth con JWTs reales.
3. Preparar la Edge Function para el webhook de WhatsApp Cloud API.
