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
    <nav className="fixed bottom-0 left-0 right-0 z-40 app-glass border-t border-white/40 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 pt-2 pb-1">
        {items.map(([to, Icon, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `tap flex h-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition-colors ${
                isActive
                  ? 'text-[var(--qlm-primary)]'
                  : 'text-[var(--qlm-muted)] hover:bg-slate-50 active:bg-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`grid h-8 w-14 place-items-center rounded-full transition-all duration-300 ${isActive ? 'bg-[var(--qlm-bg-soft)]' : ''}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[var(--qlm-primary)]' : 'text-[var(--qlm-muted)]'} />
                </div>
                <span className="tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}