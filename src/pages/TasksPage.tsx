import { useState, type FormEvent } from 'react';
import { Task } from '../types';
import { TaskCard } from '../components/cards/TaskCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { mockTasks } from '../data/mockTasks';
import { mockSections } from '../data/mockSections';
import { authService } from '../services/authService';
import { useLocalCollection } from '../hooks/useLocalCollection';
import { todayISO, isPast } from '../utils/dates';

const statuses = ['Pendiente', 'En progreso', 'En revisión', 'Bloqueada', 'Terminada', 'Vencida'];
const priorities = ['Baja', 'Media', 'Alta', 'Urgente'];

export function TasksPage() {
  const user = authService.current()!;
  const { items, add, update, remove } = useLocalCollection<Task>('qlm_tasks', mockTasks);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [section, setSection] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const allowed = mockSections.filter((item) => user.sections.includes(item.id));
  const visible = items.filter(
    (task) => user.sections.includes(task.sectionId) && (section === 'all' || task.sectionId === section) && (status === 'all' || task.status === status) && (priority === 'all' || task.priority === priority),
  );

  function save(event: FormEvent<HTMLFormElement>) {
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
      updatedAt: new Date().toISOString(),
    };
    if (editing) update(editing.id, payload);
    else add({ id: crypto.randomUUID(), client: '', createdAt: new Date().toISOString(), ...payload });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Tareas</h2>
          <p className="mt-1 text-[15px] font-semibold text-slate-500">Hoy: {items.filter((task) => user.sections.includes(task.sectionId) && task.dueDate === todayISO()).length} · Vencidas: {items.filter((task) => user.sections.includes(task.sectionId) && isPast(task.dueDate) && task.status !== 'Terminada').length}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="min-h-12 rounded-2xl px-5">Nueva</Button>
      </div>

      <ChipScroller label="Secciones" value={section} onChange={setSection} options={[{ value: 'all', label: 'Todas' }, ...allowed.map((item) => ({ value: item.id, label: item.name.split(' ')[0] }))]} />
      <ChipScroller label="Estado" value={status} onChange={setStatus} options={[{ value: 'all', label: 'Todos' }, ...statuses.map((item) => ({ value: item, label: item }))]} />
      <ChipScroller label="Prioridad" value={priority} onChange={setPriority} options={[{ value: 'all', label: 'Todas' }, ...priorities.map((item) => ({ value: item, label: item }))]} />

      <div className="space-y-3">
        {visible.length ? (
          visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDone={() => update(task.id, { status: 'Terminada', updatedAt: new Date().toISOString() })}
              onEdit={() => {
                setEditing(task);
                setOpen(true);
              }}
              onDelete={() => remove(task.id)}
            />
          ))
        ) : (
          <EmptyState title="Sin tareas" description="Crea una tarea o cambia los filtros." />
        )}
      </div>

      <Modal open={open} title={editing ? 'Editar tarea' : 'Nueva tarea'} onClose={() => { setOpen(false); setEditing(null); }}>
        <form onSubmit={save} className="space-y-3">
          <Input name="title" defaultValue={editing?.title} placeholder="Título" required />
          <Textarea name="description" defaultValue={editing?.description} placeholder="Descripción" />
          <Select name="sectionId" defaultValue={editing?.sectionId || allowed[0]?.id}>{allowed.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          <div className="grid grid-cols-2 gap-2">
            <Select name="priority" defaultValue={editing?.priority || 'Media'}>{priorities.map((item) => <option key={item}>{item}</option>)}</Select>
            <Select name="status" defaultValue={editing?.status || 'Pendiente'}>{statuses.map((item) => <option key={item}>{item}</option>)}</Select>
          </div>
          <Input name="dueDate" type="date" defaultValue={editing?.dueDate || todayISO()} />
          <Input name="assignee" defaultValue={editing?.assignee || user.name.split(' ')[0]} placeholder="Responsable" />
          <Button className="min-h-14 w-full">Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}

function ChipScroller({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <section>
      <p className="mb-2 text-sm font-black text-slate-500">{label}</p>
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-black ${value === option.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
