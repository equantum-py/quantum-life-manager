# Implementación de Base de Datos: Recordatorios (REM-2)

## 1. Estado de la Implementación
Se ha creado la estructura fundamental para que Quantum Life Manager pueda gestionar recordatorios internos en la base de datos de Supabase. El código frontend ya está cableado para leer la tabla `reminders` de manera segura, sin colapsar si la tabla aún no fue creada en producción.

## 2. Instrucciones para Ejecutar SQL (Manual)
Dado que estamos operando en un entorno de producción (o casi producción), el esquema SQL no se ejecutó automáticamente. Para habilitar los recordatorios, un administrador debe realizar los siguientes pasos:

1. Entrar al **Supabase Dashboard** de tu proyecto.
2. Ir a la sección **SQL Editor**.
3. Crear una nueva query y pegar el contenido completo del archivo `supabase/reminders_schema.sql`.
4. Ejecutar la query (`Run`).

Este script creará la tabla `reminders`, los índices de optimización, y asegurará la tabla con políticas **Row Level Security (RLS)** para que cada usuario solo vea y modifique sus propios recordatorios.

## 3. Pruebas y Validación Post-Ejecución
Una vez que hayas ejecutado el SQL:
- Abre la aplicación y navega a la pestaña de **Alertas** (`/alerts`).
- Deberías ver la pantalla de carga ("spinner") y luego el estado vacío: *"Todavía no hay recordatorios activos."*
- Si deseas probar la UI con datos:
  1. Ve al Table Editor en Supabase.
  2. Inserta una fila en `reminders` con tu `user_id`, título *"Probar Recordatorios"*, `remind_at` en el futuro, `channel: app`, `source_type: custom`.
  3. Recarga la app y verás la tarjeta aparecer dinámicamente.

## 4. Próximos Pasos (REM-3)
La base de datos y la vista ya están listas. En la próxima fase (REM-3), nos enfocaremos en:
- Modificar el webhook de Telegram (`index.ts`) para que, al guardar una tarea o reunión importante, inyecte automáticamente un recordatorio en esta nueva tabla.
- Modificar la UI de Tareas/Agenda para permitir crear o cancelar recordatorios visualmente.
