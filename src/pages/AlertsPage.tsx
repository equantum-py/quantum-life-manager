import { Bell } from 'lucide-react';
import { AlertCard } from '../components/cards/AlertCard';
import { mockProjects } from '../data/mockProjects';
import { mockTasks } from '../data/mockTasks';
import { mockMeetings } from '../data/mockMeetings';
import { authService } from '../services/authService';
import { buildAlerts } from '../utils/alerts';

export function AlertsPage() {
  const user = authService.current();
  
  if (!user) return null;

  const tasks = mockTasks.filter(t => user.sections.includes(t.sectionId));
  const meetings = mockMeetings.filter(m => user.sections.includes(m.sectionId));
  const projects = user.sections.includes('equantum') ? mockProjects : [];
  
  const alerts = buildAlerts(tasks, meetings, projects);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h2 className="app-mobile-title">Alertas</h2>
      
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
        </div>
      )}

      {/* REM-1: Placeholder de Recordatorios Próximos */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Próximos Recordatorios</h3>
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-slate-400">
            <Bell size={24} />
          </div>
          <p className="font-medium text-slate-600">Todavía no hay recordatorios activos.</p>
          <p className="mt-1 text-sm text-slate-400">Las notificaciones proactivas estarán disponibles pronto.</p>
        </div>
      {/* Canales de Aviso */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Canales de Aviso Activos</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-green-500 mb-2"></div>
            <span className="text-xs font-semibold text-slate-600">Telegram</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-green-500 mb-2"></div>
            <span className="text-xs font-semibold text-slate-600">App</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4 border border-dashed border-slate-200 opacity-60">
            <div className="h-2 w-2 rounded-full bg-slate-300 mb-2"></div>
            <span className="text-xs font-semibold text-slate-400">Push (Pronto)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
