import { NavLink } from 'react-router-dom';
import { Bell, CalendarDays, CheckSquare, Home, Menu } from 'lucide-react';

const items = [
  ['/dashboard', Home, 'Inicio'],
  ['/tasks', CheckSquare, 'Tareas'],
  ['/agenda', CalendarDays, 'Agenda'],
  ['/alerts', Bell, 'Alertas'],
  ['/sections', Menu, 'Más'],
] as const;

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(([to, Icon, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `tap flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-3xl text-[12px] font-bold transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 active:bg-slate-50'
              }`
            }
          >
            <Icon size={25} strokeWidth={2.4} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}