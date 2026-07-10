import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Task } from '../types';
import { TaskCard } from '../components/cards/TaskCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { mockSections } from '../data/mockSections';
import { authService } from '../services/authService';
import { taskRepository } from '../services/repositories';
import { remindersRepository } from '../services/repositories/remindersRepository';
import { todayISO, isPast } from '../utils/dates';
import { getReminderOptionsForDate, calculateReminderTime, ReminderOption } from '../utils/reminderTime';

const statuses = [
  'Pendiente',
  'En progreso',
  'En revisión',
  'Bloqueada',
  'Terminada',
  'Vencida',
] as const;

const priorities = ['Baja', 'Media', 'Alta', 'Urgente'] as const;

export function TasksPage() {
  const user = authService.current()!;

  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [section, setSection] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  
  // Nuevo estado para la opción seleccionada de recordatorio (en creación)
  const [reminderOption, setReminderOption] = useState<ReminderOption>('none');
  const [formDueDate, setFormDueDate] = useState(todayISO());

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskRepository.listTasks();
      if (!Array.isArray(data)) {
        throw new Error('La respuesta de Supabase no es un array válido de tareas.');
      }
      setItems(data);
    } catch (err: any) {
      console.error('Error al cargar tareas:', err);
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const allowed = mockSections.filter((item) =>
    user.sections.includes(item.id)
  );

  const safeTasks = Array.isArray(items) ? items.filter(Boolean) : [];

  const visible = safeTasks.filter(
    (task) =>
      task &&
      task.sectionId &&
      user.sections.includes(task.sectionId) &&
      (section === 'all' || task.sectionId === section) &&
      (status === 'all' || task.status === status) &&
      (priority === 'all' || task.priority === priority)
  );

  const todayCount = safeTasks.filter(
    (task) =>
      task && task.sectionId && user.sections.includes(task.sectionId) && task.dueDate === todayISO()
  ).length;

  const overdueCount = safeTasks.filter(
    (task) =>
      task &&
      task.sectionId &&
      user.sections.includes(task.sectionId) &&
      task.dueDate && isPast(task.dueDate) &&
      task.status !== 'Terminada'
  ).length;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      sectionId: form.get('sectionId') as Task['sectionId'],
      priority: form.get('priority') as Task['priority'],
      status: form.get('status') as Task['status'],
      dueDate: form.get('dueDate') as string,
      assignee: form.get('assignee') as string,
    };

    try {
      if (editing) {
        await taskRepository.updateTask(editing.id, payload);
      } else {
        const newTask = await taskRepository.createTask({
          ...payload,
          client: '', // placeholder for now or add to form
        });

        // REM-3: Crear recordatorio si se seleccionó uno
        if (reminderOption !== 'none' && newTask.id) {
          const remindAt = calculateReminderTime(reminderOption, payload.dueDate);
          if (remindAt) {
            try {
              await remindersRepository.createReminder({
                user_id: user.id,
                source_type: 'task',
                source_id: newTask.id,
                title: newTask.title,
                remind_at: remindAt,
                channel: 'app',
                status: 'pending',
                metadata: { priority: newTask.priority }
              });
            } catch (reminderErr) {
              console.error('Error creando recordatorio suave:', reminderErr);
              // Fallback suave, no rompemos la app
            }
          }
        }
      }
      await loadTasks();
      setOpen(false);
      setEditing(null);
      setReminderOption('none');
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await taskRepository.deleteTask(id);
      await loadTasks();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  async function handleMarkDone(id: string) {
    try {
      await taskRepository.markTaskDone(id);
      await loadTasks();
    } catch (err: any) {
      alert(`Error al completar: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="app-mobile-title">
            Tareas
          </h2>

          <p className="mt-1 text-[15px] font-semibold text-slate-500">
            Hoy: {todayCount} · Vencidas: {overdueCount}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-12 rounded-2xl px-5"
        >
          Nueva
        </Button>
      </div>

      <ChipScroller
        label="Secciones"
        value={section}
        onChange={setSection}
        options={[
          { value: 'all', label: 'Todas' },
          ...allowed.map((item) => ({
            value: item.id,
            label: item.name.split(' ')[0],
          })),
        ]}
      />

      <ChipScroller
        label="Estado"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'Todos' },
          ...statuses.map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />

      <ChipScroller
        label="Prioridad"
        value={priority}
        onChange={setPriority}
        options={[
          { value: 'all', label: 'Todas' },
          ...priorities.map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          <p className="font-bold text-lg mb-2">No se pudieron cargar las tareas</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-slate-400">
          Cargando tareas...
        </div>
      ) : (
        <div className="space-y-3">
          {visible.length ? (
            visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDone={() => handleMarkDone(task.id)}
                onEdit={() => {
                  setEditing(task);
                  setOpen(true);
                }}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          ) : (
            <EmptyState
              title="Sin tareas"
              description="Crea una tarea o cambia los filtros."
            />
          )}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? 'Editar tarea' : 'Nueva tarea'}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setReminderOption('none');
          setFormDueDate(todayISO());
        }}
      >
        <form onSubmit={save} className="space-y-3">
          <Input
            name="title"
            defaultValue={editing?.title}
            placeholder="Título"
            required
          />

          <Textarea
            name="description"
            defaultValue={editing?.description}
            placeholder="Descripción"
          />

          <Select
            name="sectionId"
            defaultValue={editing?.sectionId || allowed[0]?.id}
          >
            {allowed.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Select
              name="priority"
              defaultValue={editing?.priority || 'Media'}
            >
              {priorities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>

            <Select name="status" defaultValue={editing?.status || 'Pendiente'}>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </div>

          <Input
            name="dueDate"
            type="date"
            value={formDueDate}
            onChange={(e) => setFormDueDate(e.target.value)}
          />

          {!editing && (
            <Select
              name="reminder"
              value={reminderOption}
              onChange={(e) => setReminderOption(e.target.value as ReminderOption)}
            >
              {getReminderOptionsForDate(formDueDate).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          )}

          <Input
            name="assignee"
            defaultValue={editing?.assignee || user.name.split(' ')[0]}
            placeholder="Responsable"
          />

          <Button className="min-h-14 w-full">Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}

function ChipScroller({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section>
      <p className="mb-2 text-[13px] font-bold uppercase tracking-wider text-slate-500">{label}</p>

      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8 [padding-right:calc(2rem+env(safe-area-inset-right))]">
        <div className="flex w-max gap-2 pb-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`app-pill shrink-0 whitespace-nowrap ${
                value === option.value
                  ? '!bg-[var(--qlm-primary)] !text-white !border-none'
                  : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}