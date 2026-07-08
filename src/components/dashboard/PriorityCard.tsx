import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { prettyDate } from '../../utils/dates';

export function PriorityCard({ task }: { task?: Task }) {
  if (!task) {
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-black uppercase tracking-wide text-green-600">Prioridad ahora</p>
        <h3 className="mt-2 text-xl font-black text-slate-950">Todo está en orden</h3>
        <p className="mt-2 text-[15px] text-slate-500">No tenés tareas urgentes para este momento.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-soft">
      <p className="text-sm font-black uppercase tracking-wide text-blue-200">Prioridad ahora</p>
      <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em]">{task.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{task.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
        <span className="rounded-full bg-white/10 px-3 py-1.5">{task.sectionId}</span>
        <span className="rounded-full bg-red-500/20 px-3 py-1.5 text-red-100">{task.priority}</span>
        <span className="rounded-full bg-white/10 px-3 py-1.5">{prettyDate(task.dueDate)}</span>
      </div>
      <div className="mt-5 flex gap-3">
        <Link to="/tasks" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-950">
          <CheckCircle2 size={19} />
          Terminar
        </Link>
        <Link to="/tasks" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-white/10 px-4 text-sm font-black text-white">
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
