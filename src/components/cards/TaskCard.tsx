import { CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Task } from '../../types';
import { prettyDate } from '../../utils/dates';

const priorityStyles = {
  Baja: 'bg-slate-100 text-slate-600',
  Media: 'bg-blue-100 text-blue-700',
  Alta: 'bg-amber-100 text-amber-700',
  Urgente: 'bg-red-100 text-red-700',
};

export function TaskCard({
  task,
  onDone,
  onEdit,
  onDelete,
}: {
  task: Task;
  onDone?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-400">
            {task.sectionId}
          </p>

          <h3 className="text-[20px] font-black leading-snug tracking-[-0.02em] text-slate-950">
            {task.title}
          </h3>

          <p className="mt-2 text-[16px] leading-relaxed text-slate-500">
            {task.description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-bold text-slate-400">Fecha límite</p>
          <p className="text-sm font-black text-slate-800">
            {prettyDate(task.dueDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-green-600 px-5 text-[15px] font-black text-white shadow-sm transition-transform active:scale-95"
            >
              <CheckCircle2 size={20} />
              Terminar
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="grid min-h-[48px] min-w-[48px] place-items-center rounded-2xl bg-slate-100 text-slate-600 transition-colors active:bg-slate-200"
              aria-label="Editar tarea"
            >
              <MoreHorizontal size={24} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="hidden rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 md:block"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
