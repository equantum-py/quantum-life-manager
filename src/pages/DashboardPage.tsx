import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, FileText, PlusCircle, MessageSquare } from 'lucide-react';
import { AlertCard } from '../components/cards/AlertCard';
import { MeetingCard } from '../components/cards/MeetingCard';
import { SectionCard } from '../components/cards/SectionCard';
import { TaskCard } from '../components/cards/TaskCard';
import { authService } from '../services/authService';
import {
  sectionRepository,
  taskRepository,
  meetingRepository,
  projectRepository,
} from '../services/repositories';
import { buildAlerts } from '../utils/alerts';
import { isPast, isToday, prettyDate, todayISO } from '../utils/dates';
import { Section, Task, Meeting, Project } from '../types';

export function DashboardPage() {
  const user = authService.current()!;

  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allSections, allTasks, allMeetings, allProjects] = await Promise.all([
        sectionRepository.listSections(),
        taskRepository.listTasks(),
        meetingRepository.listMeetings(),
        projectRepository.listProjects(),
      ]);

      setSections(allSections.filter((s) => s && s.id && user.sections.includes(s.id)));
      setTasks(allTasks.filter((t) => t && t.sectionId && user.sections.includes(t.sectionId)));
      setMeetings(allMeetings.filter((m) => m && m.sectionId && user.sections.includes(m.sectionId)));
      setProjects(allProjects.filter(() => user.sections.includes('equantum')));

    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [user.sections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="app-muted font-semibold text-[16px]">Cargando tu panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--qlm-radius-md)] bg-red-50 p-6 text-[15px] font-bold text-red-600">
        {error}
      </div>
    );
  }

  const alerts = buildAlerts(tasks, meetings, projects);

  const todayTasks = tasks.filter(
    (task) => task && task.dueDate && isToday(task.dueDate) && task.status !== 'Terminada'
  );

  const overdueTasks = tasks.filter(
    (task) =>
      task &&
      task.dueDate &&
      (isPast(task.dueDate) || task.status === 'Vencida') &&
      task.status !== 'Terminada'
  );

  const nextMeetings = meetings
    .filter((meeting) => meeting && meeting.date && meeting.date >= todayISO())
    .slice(0, 3);

  const mainAlert = alerts[0];

  return (
    <>
      <MobileDashboard
        userName={user.name.split(' ')[0]}
        sections={sections}
        todayTasks={todayTasks}
        overdueTasks={overdueTasks}
        nextMeetings={nextMeetings}
        mainAlert={mainAlert}
      />

      <DesktopDashboard
        sections={sections}
        tasks={tasks}
        meetings={meetings}
        projects={projects}
        alerts={alerts}
      />
    </>
  );
}

function MobileDashboard({
  userName,
  sections,
  todayTasks,
  overdueTasks,
  nextMeetings,
  mainAlert,
}: {
  userName: string;
  sections: Section[];
  todayTasks: Task[];
  overdueTasks: Task[];
  nextMeetings: Meeting[];
  mainAlert?: any;
}) {
  const isOrganized = overdueTasks.length === 0 && mainAlert === undefined;
  const hasData = todayTasks.length > 0 || nextMeetings.length > 0 || overdueTasks.length > 0;

  return (
    <div className="space-y-8 md:hidden">
      {/* A. Header contextual */}
      <section className="mb-2">
        <p className="app-muted mb-1 text-[13px] font-bold uppercase tracking-wider">{prettyDate(new Date())}</p>
        <h1 className="app-mobile-title mb-1">
          Hola, {userName}
        </h1>
        <p className="text-[17px] font-medium text-slate-500">
          Este es tu resumen de hoy
        </p>
      </section>

      {/* B. Hero card / resumen del día */}
      <section>
        <div className="app-card border-none shadow-[var(--qlm-shadow-premium)] p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--qlm-primary)] opacity-[0.04] blur-2xl"></div>
          
          <h2 className="text-[24px] font-black leading-tight tracking-tight text-slate-900 mb-5 relative z-10">
            {!hasData ? 'Día libre 🌴' : isOrganized ? 'Día organizado ✨' : 'Pendientes importantes'}
          </h2>
          
          {hasData ? (
            <div className="flex items-center gap-8 relative z-10">
              <div className="flex flex-col">
                <span className="text-[40px] font-black leading-none text-[var(--qlm-primary)] mb-1">{todayTasks.length}</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Tareas</span>
              </div>
              
              {overdueTasks.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-[40px] font-black leading-none text-red-500 mb-1">{overdueTasks.length}</span>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-red-500">Vencidas</span>
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="text-[40px] font-black leading-none text-slate-800 mb-1">{nextMeetings.length}</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Reuniones</span>
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--qlm-radius-md)] bg-slate-50 p-5 text-center border border-slate-100">
              <p className="text-[15px] font-bold text-slate-500">Sin pendientes importantes por ahora.</p>
            </div>
          )}
        </div>
      </section>

      {/* C. Acciones rápidas */}
      <section>
        <h2 className="app-section-title">Acciones rápidas</h2>
        <div className="grid grid-cols-4 gap-3">
          <Link to="/tasks" className="app-card-soft tap flex flex-col items-center justify-center p-3">
             <div className="bg-blue-100 text-blue-700 h-12 w-12 rounded-full grid place-items-center mb-2 shadow-sm">
               <PlusCircle size={24} />
             </div>
             <span className="text-[12px] font-bold text-slate-700">Tarea</span>
          </Link>
          <Link to="/agenda" className="app-card-soft tap flex flex-col items-center justify-center p-3">
             <div className="bg-violet-100 text-violet-700 h-12 w-12 rounded-full grid place-items-center mb-2 shadow-sm">
               <CalendarPlus size={24} />
             </div>
             <span className="text-[12px] font-bold text-slate-700">Evento</span>
          </Link>
          <Link to="/notes" className="app-card-soft tap flex flex-col items-center justify-center p-3">
             <div className="bg-emerald-100 text-emerald-700 h-12 w-12 rounded-full grid place-items-center mb-2 shadow-sm">
               <FileText size={24} />
             </div>
             <span className="text-[12px] font-bold text-slate-700">Nota</span>
          </Link>
          <Link to="/telegram" className="app-card-soft tap flex flex-col items-center justify-center p-3">
             <div className="bg-sky-100 text-sky-600 h-12 w-12 rounded-full grid place-items-center mb-2 shadow-sm">
               <MessageSquare size={24} />
             </div>
             <span className="text-[12px] font-bold text-slate-700">Bot</span>
          </Link>
        </div>
      </section>

      {/* D. Secciones principales */}
      <section>
        <h2 className="app-section-title">Tus áreas</h2>
        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              pending={
                todayTasks.filter((task) => task.sectionId === section.id).length
              }
              hasAlert={overdueTasks.some(
                (task) => task.sectionId === section.id
              )}
            />
          ))}
          {sections.length === 0 && (
            <div className="app-card-soft text-center p-6">
              <p className="app-muted font-semibold">No hay áreas activas.</p>
            </div>
          )}
        </div>
      </section>

      {/* E. Próximas tareas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="app-section-title !mb-0">Próximas tareas</h2>
          <Link to="/tasks" className="app-pill !px-4 !py-1.5 !text-sm">Ver todas</Link>
        </div>
        <div className="flex flex-col gap-3">
          {todayTasks.length > 0 ? (
            todayTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="app-card-soft text-center p-6">
              <p className="app-muted font-semibold">Sin tareas pendientes por ahora.</p>
            </div>
          )}
        </div>
      </section>

      {/* F. Próximas reuniones */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="app-section-title !mb-0">Agenda próxima</h2>
          <Link to="/agenda" className="app-pill !px-4 !py-1.5 !text-sm">Ver todo</Link>
        </div>
        <div className="flex flex-col gap-3">
          {nextMeetings.length > 0 ? (
            nextMeetings.slice(0, 3).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))
          ) : (
            <div className="app-card-soft text-center p-6">
              <p className="app-muted font-semibold">No tenés reuniones para hoy.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Alerta principal (si existe) */}
      {mainAlert && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="app-section-title !mb-0">Alerta principal</h2>
            <Link to="/alerts" className="app-pill !px-4 !py-1.5 !text-sm">Alertas</Link>
          </div>
          <AlertCard alert={mainAlert} />
        </section>
      )}
    </div>
  );
}

function DesktopDashboard({
  sections,
  tasks,
  meetings,
  alerts,
}: {
  sections: Section[];
  tasks: Task[];
  meetings: Meeting[];
  projects: Project[];
  alerts: any[];
}) {
  return (
    <div className="hidden md:grid md:grid-cols-2 md:gap-8">
      {/* Columna Izquierda */}
      <div className="space-y-6">
        <section className="app-card bg-[var(--qlm-primary)] text-white border-none shadow-[var(--qlm-shadow-premium)] p-8">
          <p className="text-blue-200 font-semibold mb-2 uppercase tracking-wide text-sm">{prettyDate(new Date())}</p>
          <h2 className="text-4xl font-black mb-3">Panel Principal</h2>
          <p className="text-lg text-blue-100 font-medium">Resumen de tareas, reuniones, alertas y áreas activas.</p>
        </section>

        <section>
          <h2 className="app-section-title">Tus áreas</h2>
          <div className="grid grid-cols-2 gap-4">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </section>
      </div>

      {/* Columna Derecha */}
      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="app-section-title !mb-0">Tareas de hoy</h2>
            <Link to="/tasks" className="app-pill">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {tasks
              .filter((task) => isToday(task.dueDate))
              .slice(0, 4)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            {tasks.filter((task) => isToday(task.dueDate)).length === 0 && (
              <div className="app-card-soft text-center p-6">
                <p className="app-muted font-semibold">Sin tareas pendientes por ahora.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
             <h2 className="app-section-title !mb-0">Alertas y Reuniones</h2>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 2).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
            {meetings.slice(0, 2).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}