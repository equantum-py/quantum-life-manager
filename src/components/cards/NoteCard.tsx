import { FileText, MoreHorizontal } from 'lucide-react';
import { Note } from '../../types';

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="app-card">
      <div className="flex gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--qlm-radius-md)] bg-emerald-100/50 text-emerald-700 ring-1 ring-emerald-200/50">
          <FileText size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-[18px] font-bold text-slate-900">
              {note.title}
            </h3>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {note.category}
            </span>
          </div>

          <p className="mt-1 line-clamp-3 text-[15px] font-medium leading-relaxed text-slate-500">
            {note.content}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 rounded-[var(--qlm-radius-sm)] bg-slate-50 py-3 text-[14px] font-bold text-slate-700 active:bg-slate-100"
          >
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 rounded-[var(--qlm-radius-sm)] bg-red-50 py-3 text-[14px] font-bold text-red-600 active:bg-red-100"
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}
