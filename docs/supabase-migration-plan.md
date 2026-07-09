# Supabase Migration Plan (Fase 2)

## 1. Estado Actual de la App
La aplicación funciona enteramente en el lado del cliente (Frontend).
Los datos están simulados (mockeados) y se conservan utilizando `localStorage` en el navegador. Las entidades actualmente simuladas son:
- **auth mock**: Inicio de sesión simulado (`authService`).
- **mockTasks**: Tareas guardadas localmente.
- **mockMeetings**: Eventos y reuniones del calendario.
- **mockNotes**: Notas asociadas a las diferentes secciones.
- **mockProjects**: Proyectos específicos del área eQuantum.
- **mockSections**: Datos estáticos de las 5 áreas vitales.

## 2. Objetivo
Migrar progresivamente toda la arquitectura de datos desde `localStorage` hacia una base de datos real (PostgreSQL en Supabase), garantizando que el "Modo Demo" (mock) no se rompa y pueda seguir siendo utilizado como entorno de desarrollo o prueba aislada.

## 3. Estrategia de Doble Modo (Feature Toggles)
Para garantizar una transición segura, la aplicación leerá variables de entorno que dictarán el comportamiento de los repositorios de datos:
- `VITE_DATA_MODE=mock`: Utiliza la implementación actual (`localStorage`).
- `VITE_DATA_MODE=supabase`: Utiliza los clientes conectados directamente a Supabase Realtime/REST.
Esta separación se realizará mediante el uso del patrón "Repository" o adaptadores dentro de los `services`.

## 4. Tablas Necesarias
En Supabase se deberán crear las siguientes tablas:
- `profiles`: Datos extendidos del usuario (vinculado a `auth.users` de Supabase).
- `sections`: Catálogo de las áreas (familia, iglesia, inverfin, equantum, idear).
- `section_members`: Para manejar qué usuarios tienen acceso a qué áreas.
- `tasks`: Tareas (título, sección, prioridad, fecha límite, estado).
- `meetings`: Eventos en calendario.
- `notes`: Bloc de notas estructurado por áreas.
- `projects`: Seguimiento de proyectos (eQuantum).
- `reminders`: Sistema de alarmas futuras.
- `whatsapp_logs`: Auditoría cruda de mensajes que ingresan vía Meta.
- `ai_classifications`: Almacenamiento del resultado parseado por la IA.

## 5. Relaciones entre Tablas
- `tasks.section_id` -> `sections.id`
- `meetings.section_id` -> `sections.id`
- `notes.section_id` -> `sections.id`
- `projects.section_id` -> `sections.id`
- `section_members.section_id` -> `sections.id`
- `section_members.user_id` -> `profiles.id`
- `ai_classifications.whatsapp_log_id` -> `whatsapp_logs.id`

## 6. Políticas RLS (Row Level Security)
PostgreSQL en Supabase asegura los datos a nivel de fila. Se implementarán las siguientes políticas estrictas:
- **Derlis**: Acceso total a todas las filas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) al ser el administrador principal y owner.
- **Daniel**: Lectura/Escritura limitada *exclusivamente* a filas donde `section_id = 'equantum'`.
- **Gabriela**: Lectura/Escritura limitada *exclusivamente* a filas donde `section_id = 'familia'`.
*Los accesos se resolverán haciendo join implícito a través de la tabla `section_members`.*

## 7. Servicios a Crear / Refactorizar
Se refactorizarán los siguientes servicios para que retornen datos mock o datos reales dependiendo de la variable `VITE_DATA_MODE`:
- `taskService.ts`
- `meetingService.ts`
- `noteService.ts`
- `projectService.ts`
- `sectionService.ts`
- `whatsappLogService.ts` (Nuevo, para leer logs del Webhook).

## 8. Migración de los Datos Mock (Seed SQL)
Los archivos actuales como `src/data/mockTasks.ts` se convertirán en scripts `seed.sql` ejecutables en Supabase o en un script de Node (e.g. `npm run db:seed`) que utilice el cliente de Supabase para poblar la base de datos de desarrollo con la información exacta que se ve en pantalla hoy.

## 9. Fallback a LocalStorage
Si `VITE_DATA_MODE=supabase` está activo pero la aplicación detecta que faltan las credenciales (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) en el archivo `.env`, se mostrará una alerta en la consola y la app caerá de forma elegante a `VITE_DATA_MODE=mock`, para que el desarrollador nunca experimente una pantalla blanca.

## 10. Fases de Implementación
- **Fase 2.1**: Estructura Local SQL.
  - Esquema base (`migrations/0001_initial_schema.sql`).
  - Seguridad (`migrations/0002_rls_policies.sql`).
  - Semillas y datos estáticos (`seed.sql`).
  - Documentación (`README.md`).
- **Fase 2.2**: Inicialización del cliente de Supabase (`src/lib/supabaseClient.ts`) e integración de variables de entorno.
  - **Cliente y feature flag**: En esta fase sólo se prepara la conexión base, inyectando `appConfig.ts` y `dataModeService.ts` para establecer las banderas (`mock` vs `supabase`). Todavía no se migran datos reales a Supabase ni se alteran las interfaces visuales; simplemente se deja el cliente de @supabase/supabase-js expuesto de manera segura para ser utilizado progresivamente por los repositorios.
- **Fase 2.3**: Repository Layer Mock/Supabase (`src/services/repositories/`).
  - **Capa Abstracción**: Se crea un patrón Factory (Repositorios) que divide responsabilidades. Las pantallas no saben de dónde vienen los datos. El factory intercepta la petición y si el `VITE_DATA_MODE` es mock, va al LocalStorage. Si es supabase, va a la nube de Supabase.
  - **Transición Gradual**: Esto permite migrar pantalla por pantalla y probar Supabase en un módulo a la vez sin romper la estructura principal basada en mock. Esta capa es la base para la Fase 2.4.
- **Fase 2.4**: Migración inicial de TasksPage al Repository Layer.
  - **Prueba de Fuego (Tareas)**: Se refactorizó `TasksPage.tsx` para dejar de usar el viejo hook `useLocalCollection` y en su lugar conectarse al `taskRepository`. Tareas se migró primero por ser el módulo principal y más usado, actuando como piloto perfecto.
  - **Validación Mock**: El objetivo primario es que la pantalla no cambie de apariencia y que todas las acciones asíncronas (crear, editar, borrar, completar) sigan reaccionando con la inmediatez de siempre usando `localStorage`.
  - **Validación Futura (Supabase)**: En el futuro, cambiar `VITE_DATA_MODE=supabase` debería hidratar la UI con datos vivos de PostgreSQL. La UI (TasksPage) ya incluye manejo de `loading` y `error`, por lo que está lista para enfrentar la latencia de la red.
  - **Pendientes de migración**: Faltan por migrar la Agenda, las Notas, los Proyectos y refactorizar el Auth local al Supabase Auth.
- **Fase 2.5 y 2.6**: Migración de Agenda y Notas al Repository Layer.
  - Se replicó el éxito de Tareas. `AgendaPage.tsx` ahora consume exclusivamente `meetingRepository`, y `NotesPage.tsx` consume `noteRepository`.
  - Ambas pantallas implementan manejo de estado asincrónico real (`loading`, `error`) preparándose para la latencia que traerá la nube.
  - El modo de repliegue (*fallback*) `VITE_DATA_MODE=mock` se mantiene intacto, persistiendo todo el uso diario en `localStorage`.
  - **Pendientes de migración**: Aún falta refactorizar los Proyectos (`ProjectsPage`), las Secciones estáticas, el Dashboard principal y, finalmente, reemplazar el sistema de autenticación local por Supabase Auth.
- **Fase 2.6**: Migración de Proyectos, Secciones y Dashboard al Repository Layer.
  - Se completó la migración de todas las pantallas dependientes de colecciones locales, incluyendo `SectionsPage`, `SectionDetailPage` y `DashboardPage`.
  - El Dashboard ahora utiliza un `Promise.all` para cargar de manera eficiente todas las entidades necesarias simultáneamente desde la nueva capa de repositorios.
  - Con esto, toda la lógica de negocio asíncrona de datos está lista. La validación en modo mock asegura que el `localStorage` siga persistiendo la sesión con inmediatez.
  - La validación en modo Supabase funcionará automáticamente gracias al enrutamiento del factory, pero requerirá la configuración de variables de entorno y Supabase Auth.
  - **Pendiente único**: Configurar Supabase Auth y reemplazar el mock de `authService`.
- **Fase 2.7**: Supabase Auth dual.
  - Se diseñó un `AuthProvider` con dos implementaciones (`mockAuthProvider` y `supabaseAuthProvider`), manteniendo `authService` como el enrutador principal en base a `VITE_DATA_MODE`.
  - En modo mock, el inicio de sesión y la hidratación de perfiles es instantánea vía localStorage. En modo supabase, interactúa con `supabase.auth.getSession`, recupera los metadatos desde las tablas `profiles` y `section_members`, y soporta de forma asíncrona estados de carga.
  - Para proteger las rutas y mantener la UX estable, `ProtectedRoute.tsx` y `LoginPage.tsx` fueron actualizados para esperar a que `authService.initialize()` concluya antes de intentar renderizar o redirigir.
  - **Pendientes para habilitar Supabase**: Crear manualmente los usuarios en el panel de Supabase Auth, registrar sus UUIDs en la tabla `profiles` e insertar sus roles en `section_members`.
- **Fase 2.8**: Validación real de Supabase antes de activar producción.
  - Se crearon documentos y scripts para ejecutar una prueba en seco en Supabase (`docs/supabase-activation-checklist.md`, `supabase/manual-profile-setup.sql`, `supabase/validation-queries.sql`).
  - Esta fase garantiza que cuando `VITE_DATA_MODE=supabase` sea activado, las migraciones, políticas de RLS, perfiles y permisos (`section_members`) ya estén completamente operativos.

## 3. Integración de WhatsApp & IA

- **Fase 3.1**: Conectar la lógica del simulador WhatsApp (`/whatsapp-test`) para que inserte en las tablas reales de `ai_classifications` en lugar de sólo imprimir en pantalla.

## 11. Riesgos y Mitigaciones
- **Romper permisos (RLS)**: Si el RLS falla, Daniel podría ver datos de Inverfin. *Mitigación: Testear RLS simulando los JWT en el SQL Editor antes de conectar el frontend.*
- **Perder datos locales**: Al cambiar a Supabase, el localStorage ya no será la fuente de la verdad para ese modo. *Mitigación: El script seed.sql replicará el entorno visual exactamente.*
- **Supabase sin variables en Vercel**: Un despliegue puede fallar si no se copian las variables. *Mitigación: Fallback robusto a `mock`.*

## 12. Checklist de Validación
- [ ] La app arranca en modo `mock` sin errores.
- [ ] La app arranca en modo `supabase` con datos leídos de la BD remota.
- [ ] Iniciar sesión con "Daniel" restringe la vista a eQuantum remotamente.
- [ ] La pantalla `/whatsapp-test` no se ha visto alterada y sigue funcionando en modo simulador (aunque en el futuro apunte a Supabase).
