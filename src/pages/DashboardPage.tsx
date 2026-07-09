import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, FileText, PlusCircle } from 'lucide-react';
import { AlertCard } from '../components/cards/AlertCard';
import { MeetingCard } from '../components/cards/MeetingCard';
import { SectionCard } from '../components/cards/SectionCard';
import { StatCard } from '../components/cards/StatCard';
import { TaskCard } from '../components/cards/TaskCard';
import { PriorityCard } from '../components/dashboard/PriorityCard';
import { QuickActionButton } from '../components/dashboard/QuickActionButton';
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
        <p className="text-sm font-semibold text-slate-400">Cargando tu panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
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
    .slice(0, 2);

  const priorityTask = [...todayTasks, ...overdueTasks].sort((a, b) => {
    if (!a.priority || !b.priority) return 0;
    const order = {
      Urgente: 0,
      Alta: 1,
      Media: 2,
      Baja: 3,
    } as const;
    return order[a.priority] - order[b.priority];
  })[0];

  const mainAlert = alerts[0];
  const nextMeeting = nextMeetings[0];

  const mobileStats = [
    { label: 'Hoy', value: todayTasks.length, tone: 'text-blue-600' },
    { label: 'Vencidas', value: overdueTasks.length, tone: 'text-red-600' },
    { label: 'Reuniones', value: nextMeetings.length, tone: 'text-violet-600' },
    { label: 'Alertas', value: alerts.length, tone: 'text-amber-600' },
    { label: 'Proyectos', value: projects.length, tone: 'text-emerald-600' },
  ];

  return (
    <>
      <MobileDashboard
        userName={user.name.split(' ')[0]}
        sections={sections}
        todayTasks={todayTasks}
        overdueTasks={overdueTasks}
        nextMeetings={nextMeetings}
        priorityTask={priorityTask}
        mainAlert={mainAlert}
        nextMeetingTitle={
          nextMeeting
            ? `${nextMeeting.title} a las ${nextMeeting.startTime}`
            : 'sin reuniones próximas'
        }
        stats={mobileStats}
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
  priorityTask,
  mainAlert,
  nextMeetingTitle,
  stats,
}: {
  userName: string;
  sections: Section[];
  todayTasks: Task[];
  overdueTasks: Task[];
  nextMeetings: Meeting[];
  priorityTask?: Task;
  mainAlert?: any;
  nextMeetingTitle: string;
  stats: { label: string; value: number | string; tone: string }[];
}) {
  return (
    <div className="space-y-8 md:hidden">
      <section className="space-y-4">
        <div className="mb-2">
          <h2 className="text-[24px] font-bold tracking-tight text-slate-900">
            Tus áreas
          </h2>
          <p className="text-[15px] font-medium text-slate-500">
            Organizá tu día desde cada parte de tu vida.
          </p>
        </div>

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
      </section>

      <section>
        <h2 className="mb-4 text-[20px] font-bold tracking-tight text-slate-900">
          Resumen de hoy
        </h2>
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <h3 className="text-[18px] font-semibold text-slate-900">
            Hola, {userName}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Tenés <strong className="font-semibold text-blue-700">{todayTasks.length} tareas</strong> para hoy,{' '}
            <strong className="font-semibold text-red-600">{overdueTasks.length} vencida{overdueTasks.length !== 1 && 's'}</strong> y{' '}
            <strong className="font-semibold text-violet-700">{nextMeetingTitle}</strong>.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[20px] font-bold tracking-tight text-slate-900">
          Prioridad ahora
        </h2>
        <PriorityCard task={priorityTask} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-slate-900">
            Acciones rápidas
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <QuickActionButton
            to="/tasks"
            icon={PlusCircle}
            label="Nueva tarea"
            tone="bg-blue-50 text-blue-700"
          />

          <QuickActionButton
            to="/agenda"
            icon={CalendarPlus}
            label="Nuevo evento"
            tone="bg-violet-50 text-violet-700"
          />

          <QuickActionButton
            to="/notes"
            icon={FileText}
            label="Nueva nota"
            tone="bg-emerald-50 text-emerald-700"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-slate-900">
            Próximas tareas
          </h2>

          <Link to="/tasks" className="text-sm font-black text-blue-700">
            Ver todas
          </Link>
        </div>

        {todayTasks.slice(0, 2).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-slate-900">
            Próximas reuniones
          </h2>

          <Link to="/agenda" className="text-sm font-black text-blue-700">
            Ver agenda
          </Link>
        </div>

        {nextMeetings.slice(0, 1).map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </section>

      {mainAlert && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-tight text-slate-900">
              Alerta principal
            </h2>

            <Link to="/alerts" className="text-sm font-black text-blue-700">
              Ver alertas
            </Link>
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
  projects,
  alerts,
}: {
  sections: Section[];
  tasks: Task[];
  meetings: Meeting[];
  projects: Project[];
  alerts: any[];
}) {
  return (
    <div className="hidden space-y-5 md:block">
      <section className="rounded-[2rem] bg-blue-600 p-6 text-white shadow-soft">
        <p className="text-blue-100">{prettyDate(new Date())}</p>

        <h2 className="mt-1 text-3xl font-extrabold">
          Panel principal
        </h2>

        <p className="mt-2 text-sm text-blue-100">
          Resumen de tareas, reuniones, alertas y áreas activas.
        </p>
      </section>

      <div className="grid grid-cols-5 gap-3">
        <StatCard
          label="Hoy"
          value={tasks.filter((task) => isToday(task.dueDate)).length}
        />

        <StatCard
          label="Vencidas"
          value={
            tasks.filter(
              (task) => isPast(task.dueDate) || task.status === 'Vencida'
            ).length
          }
        />

        <StatCard label="Reuniones" value={meetings.length} />
        <StatCard label="Alertas" value={alerts.length} />
        <StatCard label="Proyectos" value={projects.length} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Tareas de hoy</h2>

          {tasks
            .filter((task) => isToday(task.dueDate))
            .slice(0, 3)
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold">Alertas importantes</h2>

          {alerts.slice(0, 3).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      <h2 className="text-lg font-bold">Tus secciones</h2>

      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}