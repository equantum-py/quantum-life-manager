# Quantum Life Manager

Plataforma privada mobile-first para organizar familia, iglesia, Inverfin, eQuantum e IDEAR desde una sola app personal de productividad.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router DOM
- Lucide React
- Supabase preparado para futuro (`mock` por defecto)

## Instalación y ejecución

```bash
npm install
npm run dev
npm run build
```

## Credenciales mock

| Usuario | Email | Password | Acceso |
| --- | --- | --- | --- |
| Derlis Aguilera | `derlis@quantum.local` | `123456` | Todas las secciones |
| Daniel Sosa | `daniel@quantum.local` | `123456` | eQuantum |
| Gabriela | `gabriela@quantum.local` | `123456` | Familia |

La sesión se guarda en `localStorage`.

## Funcionalidades incluidas

- Login mock con protección básica de rutas.
- Dashboard con resumen del día, tareas, reuniones, alertas y secciones.
- 5 secciones oficiales: Familia, Iglesia, Inverfin, eQuantum e IDEAR.
- Tareas con filtros, creación, edición, eliminación y marcado como terminado usando `localStorage`.
- Agenda con eventos/reuniones editables usando `localStorage`.
- Alertas automáticas para vencimientos, urgencias, reuniones y pagos pendientes.
- Notas con búsqueda, filtros y CRUD local.
- Proyectos mock de eQuantum: GuaraMarket, Corpicia, Marmolería Pietra, Cooperativa Vida & Luz, Joyerialis, Portal Cooperativo y Portfolio personal.
- Navegación inferior móvil y sidebar opcional en desktop.

## Estructura

```txt
src/
  components/      Layout, UI y tarjetas reutilizables
  data/            Datos mock iniciales
  hooks/           Hooks de localStorage
  lib/             Cliente Supabase preparado
  pages/           Pantallas principales
  routes/          Rutas de la app
  services/        Auth mock y storage
  types/           Tipos TypeScript
  utils/           Fechas y alertas
```

## Supabase futuro

Copiar `.env.example` a `.env.local` y completar:

```env
VITE_DATA_MODE=mock
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Cuando `VITE_DATA_MODE=supabase`, la estructura ya permite reemplazar servicios mock por persistencia real sin romper el modo local.

## Próximos pasos sugeridos

1. Crear tablas y políticas RLS en Supabase.
2. Reemplazar `localStorage` por repositorios por módulo.
3. Agregar notificaciones push y recordatorios reales.
4. Añadir pruebas automatizadas y PWA offline.
