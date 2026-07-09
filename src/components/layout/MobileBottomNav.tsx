import { NavLink } from 'react-router-dom';
import { Bell, CalendarDays, CheckSquare, Home, Menu, MessageSquare } from 'lucide-react';

const items = [
  ['/dashboard', Home, 'Inicio'],
  ['/tasks', CheckSquare, 'Tareas'],
  ['/agenda', CalendarDays, 'Agenda'],
  ['/alerts', Bell, 'Alertas'],
  ['/telegram', MessageSquare, 'Telegram'],
  ['/sections', Menu, 'Más'],
] as const;

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/60 bg-white/75 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 pb-1">
        {items.map(([to, Icon, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `tap flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`grid place-items-center rounded-xl p-1 transition-all ${isActive ? 'bg-blue-100/50' : ''}`}>
                  <Icon size={26} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}