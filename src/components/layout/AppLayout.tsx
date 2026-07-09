import { NavLink, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

const links = [
  ['/dashboard', 'Inicio'],
  ['/tasks', 'Tareas'],
  ['/agenda', 'Agenda'],
  ['/alerts', 'Alertas'],
  ['/sections', 'Secciones'],
  ['/notes', 'Notas'],
  ['/settings', 'Ajustes'],
  ['/whatsapp-test', 'WhatsApp Simulator'],
  ['/telegram', 'Telegram'],
];

export function AppLayout() {
  return (
    <div className="app-shell flex-col">
      <Header />

      <div className="app-container flex w-full">
        <aside className="hidden w-64 shrink-0 p-6 md:block">
          <div className="sticky top-24 app-glass rounded-[var(--qlm-radius-lg)] p-3 shadow-[var(--qlm-shadow-soft)]">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `mb-1 block rounded-[var(--qlm-radius-sm)] px-4 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="app-page">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}