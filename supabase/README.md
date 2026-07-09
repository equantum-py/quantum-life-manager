# Quantum Life Manager - Supabase Backend

Este directorio contiene las migraciones de base de datos, las políticas de seguridad (RLS) y la semilla de datos inicial.

## Pasos manuales para activar Supabase Auth

Actualmente la app funciona al 100% en modo `mock`, pero tiene inyectado el `supabaseAuthProvider` esperando ser activado cambiando a `VITE_DATA_MODE=supabase`. 
Antes de hacer ese cambio, debes realizar los siguientes pasos de configuración manual en tu proyecto de Supabase:

### 1. Crear usuarios en Supabase Auth
Ve al panel de tu proyecto en Supabase -> **Authentication** -> **Add User**.
Crea los tres usuarios principales:
1. `derlis@quantum.local`
2. `daniel@quantum.local`
3. `gabriela@quantum.local`

(Usa `123456` u otra contraseña segura, pero asegúrate de actualizar tu `.env` o conocerla).

### 2. Copiar los UUIDs
Al crear cada usuario, Supabase les asignará un UUID único (ej: `d1c9d...`). Cópialos.

### 3. Insertar perfiles (`profiles`)
Ve a **Table Editor** -> `profiles`, e inserta una fila por cada UUID:
- Derlis: `{ id: "UUID", name: "Derlis Aguilera", role: "admin" }`
- Daniel: `{ id: "UUID", name: "Daniel Sosa", role: "collaborator" }`
- Gabriela: `{ id: "UUID", name: "Gabriela", role: "family" }`

### 4. Insertar permisos (`section_members`)
Ve a **Table Editor** -> `section_members`. 
Recuerda que Derlis (admin) no necesita estar en `section_members` para ver todo, ya que las políticas RLS le dan acceso total. Pero por seguridad de la UI, puedes insertarle todos los accesos.

- Daniel (UUID): inserta una fila vinculándolo al `section_id` = `equantum`.
- Gabriela (UUID): inserta una fila vinculándola al `section_id` = `familia`.
- Derlis (UUID): puedes insertarle `equantum`, `familia`, `iglesia`, `inverfin`, `idear`.

### 5. Validación
Una vez que las tablas tengan estos datos, puedes cambiar en tu archivo `.env`:
```env
VITE_DATA_MODE=supabase
```
La aplicación intentará loguearse contra el servidor real, descargará el perfil y cargará todo tu Dashboard desde PostgreSQL.
Mantenlo en modo `mock` hasta que termines estas pruebas.
