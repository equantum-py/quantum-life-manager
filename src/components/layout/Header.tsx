import { Bell, LogOut, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { prettyDate } from '../../utils/dates';

export function Header() {
  const user = authService.current();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/50 px-4 pb-4 pt-5 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium capitalize tracking-wide text-slate-500 md:text-sm">
            {prettyDate(new Date())}
          </p>

          <h1 className="truncate text-[22px] font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
            Hola, {user?.name.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/alerts"
            aria-label="Ver alertas"
            className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm md:h-11 md:w-11 md:rounded-2xl"
          >
            <Bell size={24} />
          </Link>

          <Link
            to="/tasks"
            aria-label="Crear rápido"
            className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-soft md:h-11 md:w-11 md:rounded-2xl"
          >
            <Plus size={26} />
          </Link>

          <button
            type="button"
            className="hidden h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm md:grid"
            onClick={() => {
              authService.logout();
              location.href = '/login';
            }}
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
