# Checklist de Activación de Supabase 🚀

Este documento detalla el procedimiento paso a paso para pasar la aplicación Quantum Life Manager de su modo local (Mock) a un entorno real conectado a Supabase en producción.

## A. Crear proyecto en Supabase
1. Ingresa a [Supabase](https://supabase.com/).
2. Crea un nuevo proyecto.
3. Toma nota de tu `URL` y tu `anon key` (Settings -> API).

## B. Ejecutar migrations
1. Ve al menú **SQL Editor** en Supabase.
2. Abre el archivo `supabase/migrations/0001_initial_schema.sql` y pégalo en el editor. Ejecútalo.
3. Abre el archivo `supabase/migrations/0002_rls_policies.sql` y pégalo en el editor. Ejecútalo.

## C. Ejecutar seed.sql
1. En el mismo **SQL Editor**, copia y pega el contenido de `supabase/seed.sql`.
2. Ejecútalo para pre-poblar las secciones y los proyectos base de la aplicación.

## D. Crear usuarios desde Supabase Auth
1. Ve a **Authentication** -> **Users** -> **Add User** -> **Create new user**.
2. Crea los siguientes usuarios con una contraseña conocida (ej. `123456`):
   - `derlis@quantum.local`
   - `daniel@quantum.local`
   - `gabriela@quantum.local`

## E. Copiar UUIDs de auth.users
1. En la lista de usuarios, copia el `User UID` de cada uno.
2. Estos UUIDs serán necesarios para el siguiente paso.

## F. Insertar perfiles (Profiles)
1. Ve a **Table Editor** -> `profiles`.
2. Crea manualmente un registro por usuario, o utiliza el script `supabase/manual-profile-setup.sql` reemplazando los placeholders con los UUIDs obtenidos.
   - Derlis -> `admin`
   - Daniel -> `collaborator`
   - Gabriela -> `family`

## G. Insertar permisos (section_members)
1. Ve a **Table Editor** -> `section_members`.
2. Asigna los permisos según los roles (también disponible en el script manual):
   - Derlis: Puede tener acceso a todas las secciones (equantum, familia, inverfin, iglesia, idear).
   - Daniel: Solo `equantum`.
   - Gabriela: Solo `familia`.

## H. Configurar variables locales
En la raíz de tu proyecto, edita el archivo `.env` o `.env.local`:
```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## I. Probar login Supabase
1. Levanta tu servidor local (`npm run dev`).
2. Entra a `/login`.
3. Inicia sesión con `derlis@quantum.local` y la contraseña.
4. Deberías ingresar al Dashboard sin errores.

## J. Validar permisos
1. Usa el archivo `supabase/validation-queries.sql` en el SQL Editor de Supabase para confirmar que las tablas están pobladas y las políticas RLS están actuando.
2. Inicia sesión como Daniel en la app y valida que solo ves "eQuantum".
3. Inicia sesión como Gabriela en la app y valida que solo ves "Familia".

## K. Volver a mock si algo falla
Si ocurre cualquier error crítico en producción o durante las pruebas:
1. Cambia en el `.env`: `VITE_DATA_MODE=mock`.
2. Refresca la aplicación.
3. Seguirá funcionando con los datos de `localStorage` instantáneamente.
