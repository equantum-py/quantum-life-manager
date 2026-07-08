import { Bell, LogOut, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { prettyDate } from '../../utils/dates';

export function Header() {
  const user = authService.current();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#F8FAFC]/95 px-5 pb-3 pt-4 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold capitalize tracking-tight text-slate-500 md:text-sm">
            {prettyDate(new Date())}
          </p>

          <h1 className="truncate text-[22px] font-black leading-tight tracking-[-0.03em] text-slate-950 md:text-2xl">
            Hola, {user?.name.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/alerts"
            aria-label="Ver alertas"
            className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:h-11 md:w-11"
          >
            <Bell size={22} />
          </Link>

          <Link
            to="/tasks"
            aria-label="Crear rápido"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-soft md:h-11 md:w-11"
          >
            <Plus size={24} />
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
