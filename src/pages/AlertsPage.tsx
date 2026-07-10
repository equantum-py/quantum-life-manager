import { useState, useEffect } from 'react';
import { Bell, Clock, Info } from 'lucide-react';
import { AlertCard } from '../components/cards/AlertCard';
import { mockProjects } from '../data/mockProjects';
import { mockTasks } from '../data/mockTasks';
import { mockMeetings } from '../data/mockMeetings';
import { authService } from '../services/authService';
import { buildAlerts } from '../utils/alerts';
import { remindersRepository } from '../services/repositories/remindersRepository';
import { Reminder } from '../types/reminder';

export function AlertsPage() {
  const user = authService.current();
  
  if (!user) return null;

  const tasks = mockTasks.filter(t => user.sections.includes(t.sectionId));
  const meetings = mockMeetings.filter(m => user.sections.includes(m.sectionId));
  const projects = user.sections.includes('equantum') ? mockProjects : [];
  
  const alerts = buildAlerts(tasks, meetings, projects);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);

  useEffect(() => {
    async function loadReminders() {
      try {
        const data = await remindersRepository.listUpcomingReminders();
        setReminders(data);
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setIsLoadingReminders(false);
      }
    }
    loadReminders();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h2 className="app-mobile-title">Alertas</h2>
      
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
        </div>
      )}

      {/* REM-2: Próximos Recordatorios */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Próximos Recordatorios</h3>
        
        {isLoadingReminders ? (
           <div className="flex justify-center p-4">
             <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
           </div>
        ) : reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map(r => (
              <div key={r.id} className="app-card flex items-start gap-4 p-4 border border-slate-100 shadow-sm">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{r.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(r.remind_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400"><Info size={14} /> {r.source_type}</span>
                  </div>
                </div>
                <div className="app-badge bg-slate-100 text-slate-600 capitalize">
                  {r.channel}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-slate-400">
              <Bell size={24} />
            </div>
            <p className="font-medium text-slate-600">Todavía no hay recordatorios activos.</p>
            <p className="mt-1 text-sm text-slate-400">Tus próximos avisos de tareas y reuniones aparecerán aquí.</p>
          </div>
        )}
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
