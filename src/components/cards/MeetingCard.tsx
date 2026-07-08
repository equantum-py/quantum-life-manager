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
    <article className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-violet-50 text-violet-700">
          <CalendarDays size={27} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[18px] font-black leading-snug tracking-[-0.02em] text-slate-950">
              {meeting.title}
            </h3>

            <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-black text-violet-700">
              {meeting.type}
            </span>
          </div>

          <p className="mt-1 text-[15px] leading-relaxed text-slate-500">
            {meeting.description}
          </p>

          <p className="mt-3 text-sm font-black text-slate-800">
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
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 text-sm font-black">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="min-h-11 flex-1 rounded-2xl bg-blue-50 px-4 text-blue-700"
            >
              Editar
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-11 flex-1 rounded-2xl bg-red-50 px-4 text-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}