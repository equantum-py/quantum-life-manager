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
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="mx-auto flex h-full max-w-6xl">
        <aside className="hidden w-64 shrink-0 p-6 md:block">
          <div className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `mb-1 block rounded-2xl px-4 py-3 text-sm font-bold ${
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

        <main className="w-full flex-1 px-4 pb-[calc(120px+env(safe-area-inset-bottom))] pt-6 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}