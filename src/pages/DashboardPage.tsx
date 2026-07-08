import { Link } from 'react-router-dom';
import { CalendarPlus, FileText, PlusCircle } from 'lucide-react';
import { AlertCard } from '../components/cards/AlertCard';
import { MeetingCard } from '../components/cards/MeetingCard';
import { SectionCard } from '../components/cards/SectionCard';
import { StatCard } from '../components/cards/StatCard';
import { TaskCard } from '../components/cards/TaskCard';
import { MobileStatScroller } from '../components/dashboard/MobileStatScroller';
import { PriorityCard } from '../components/dashboard/PriorityCard';
import { QuickActionButton } from '../components/dashboard/QuickActionButton';
import { mockMeetings } from '../data/mockMeetings';
import { mockProjects } from '../data/mockProjects';
import { mockSections } from '../data/mockSections';
import { mockTasks } from '../data/mockTasks';
import { authService } from '../services/authService';
import { buildAlerts } from '../utils/alerts';
import { isPast, isToday, prettyDate, todayISO } from '../utils/dates';

export function DashboardPage() {
  const user = authService.current()!;

  const sections = mockSections.filter((section) =>
    user.sections.includes(section.id)
  );

  const tasks = mockTasks.filter((task) =>
    user.sections.includes(task.sectionId)
  );

  const meetings = mockMeetings.filter((meeting) =>
    user.sections.includes(meeting.sectionId)
  );

  const projects = mockProjects.filter(() =>
    user.sections.includes('equantum')
  );

  const alerts = buildAlerts(tasks, meetings, projects);

  const todayTasks = tasks.filter(
    (task) => isToday(task.dueDate) && task.status !== 'Terminada'
  );

  const overdueTasks = tasks.filter(
    (task) =>
      (isPast(task.dueDate) || task.status === 'Vencida') &&
      task.status !== 'Terminada'
  );

  const nextMeetings = meetings
    .filter((meeting) => meeting.date >= todayISO())
    .slice(0, 2);

  const priorityTask = [...todayTasks, ...overdueTasks].sort((a, b) => {
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
  sections: typeof mockSections;
  todayTasks: typeof mockTasks;
  overdueTasks: typeof mockTasks;
  nextMeetings: typeof mockMeetings;
  priorityTask?: (typeof mockTasks)[number];
  mainAlert?: ReturnType<typeof buildAlerts>[number];
  nextMeetingTitle: string;
  stats: { label: string; value: number | string; tone: string }[];
}) {
  return (
    <div className="space-y-6 md:hidden">
      <section className="rounded-[2.25rem] bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-6 text-white shadow-soft">
        <p className="text-sm font-bold text-blue-100">Tu día de hoy</p>

        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
          Hola, {userName}
        </h2>

        <p className="mt-3 text-[16px] leading-relaxed text-blue-50">
          Tenés {todayTasks.length} tareas para hoy, {overdueTasks.length}{' '}
          vencida{overdueTasks.length === 1 ? '' : 's'} y {nextMeetingTitle}.
        </p>
      </section>

      <PriorityCard task={priorityTask} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
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

      <MobileStatScroller stats={stats} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
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
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
              Alerta principal
            </h2>

            <Link to="/alerts" className="text-sm font-black text-blue-700">
              Ver alertas
            </Link>
          </div>

          <AlertCard alert={mainAlert} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
          Áreas
        </h2>

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
  sections: typeof mockSections;
  tasks: typeof mockTasks;
  meetings: typeof mockMeetings;
  projects: typeof mockProjects;
  alerts: ReturnType<typeof buildAlerts>;
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