# Plan de Limpieza de Datos de Prueba (CLEAN-1)

## Objetivo
Crear un proceso seguro y estructurado para identificar y eliminar datos de prueba (mocks, ejemplos de desarrollo, tests del bot) antes de usar Quantum Life Manager v1 en un entorno de producción real, garantizando que no se pierda información genuina en el proceso.

## Tablas Afectadas
- `public.tasks`
- `public.meetings`
- `public.notes`
- `public.telegram_logs`
- `public.telegram_pending_actions`
- `public.whatsapp_logs`
- `public.ai_classifications`

## Datos Candidatos a Prueba
Se sospecha que hay basura acumulada con las siguientes palabras clave e interacciones generadas durante las pruebas:
- `Bristol`
- `FORTIS`
- `supermercado` / `supermercado LT`
- `GuaraMarket` / `carrito abandonado de GuaraMarket` (si solo fue prueba)
- `prueba` / `test`
- Mensajes del bot con texto técnico viejo ("Detecté", JSONs en logs)
- Registros antiguos anteriores a la salida a producción.

## Riesgos
- Ejecutar un `DELETE` masivo (`DELETE FROM table;`) podría destruir las configuraciones o notas reales del usuario.
- Eliminar un registro en `telegram_logs` sin considerar que un `telegram_pending_actions` puede depender de él (claves foráneas) podría causar errores si las FK constraint no son `CASCADE`.

## Estrategia Segura
La limpieza se divide en **dos fases no automatizadas**:
1. **Fase de Auditoría (`cleanup_audit.sql`)**: Extrae únicamente información (`SELECT`) para listar con precisión cuáles registros hacen match con los patrones de prueba.
2. **Fase de Borrado (`cleanup_test_data.sql`)**: Contiene las instrucciones `DELETE` pre-formateadas, pero **comentadas**. Requieren que un usuario o DBA retire el comentario y las ejecute una por una en el SQL Editor de Supabase tras validar.

## Pasos Recomendados
1. Entrar al dashboard de **Supabase**.
2. Ir a la pestaña **Database -> Backups** (o Exportar a CSV las tablas vitales) para asegurar un punto de restauración.
3. Abrir el **SQL Editor** y copiar el contenido de `supabase/cleanup_audit.sql`. Ejecutar para inspeccionar los datos sospechosos.
4. Identificar qué IDs o palabras realmente deben borrarse y ajustar las condiciones si es necesario.
5. Copiar los bloques de `supabase/cleanup_test_data.sql`, descomentarlos selectivamente y ejecutarlos.
6. Entrar a la app (Dashboard, Tasks, Agenda, Telegram) y confirmar que los datos falsos ya no están.

## Checklist Antes/Después
- [ ] Export/Backup realizado.
- [ ] Tablas de lógica de negocio (tareas, agenda, notas) inspeccionadas.
- [ ] Borrado de tareas, agenda, notas ejecutado exitosamente.
- [ ] Tablas técnicas (logs y pending actions) inspeccionadas por antigüedad o contenido.
- [ ] Borrado técnico ejecutado.
- [ ] Aplicación validada, no se detectan errores visuales por falta de datos.
