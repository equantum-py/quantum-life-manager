import { CalendarDays, MapPin } from 'lucide-react';
import { Meeting } from '../../types';
import { prettyDate } from '../../utils/dates';

export function MeetingCard({
  meeting,
  onEdit,
  onDelete,
}: {
  meeting: Meeting;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="app-card transition-all hover:bg-white/80 active:scale-[0.99]">
      <div className="flex gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-violet-100/50 text-violet-700 ring-1 ring-violet-200/50">
          <CalendarDays size={30} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[20px] font-bold leading-snug tracking-tight text-slate-900">
              {meeting.title}
            </h3>

            <span className="shrink-0 rounded-full bg-violet-100/50 px-3 py-1.5 text-xs font-bold text-violet-700">
              {meeting.type}
            </span>
          </div>

          <p className="mt-1 text-[16px] font-normal leading-relaxed text-slate-500">
            {meeting.description}
          </p>

          <p className="mt-3 text-sm font-bold text-slate-800">
            {prettyDate(meeting.date)} · {meeting.startTime}-{meeting.endTime}
          </p>

          {meeting.location && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
              <MapPin size={15} />
              {meeting.location}
            </p>
          )}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5 text-[15px] font-bold">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="min-h-[48px] flex-1 rounded-2xl bg-blue-50 px-4 text-blue-700 transition-colors active:bg-blue-100"
            >
              Editar
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[48px] flex-1 rounded-2xl bg-red-50 px-4 text-red-700 transition-colors active:bg-red-100"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}