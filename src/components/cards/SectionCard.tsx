import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Section } from '../../types';

const colorStyles = {
  rose: 'bg-rose-100/50 text-rose-600 ring-rose-200/50',
  amber: 'bg-amber-100/50 text-amber-600 ring-amber-200/50',
  blue: 'bg-blue-100/50 text-blue-600 ring-blue-200/50',
  violet: 'bg-violet-100/50 text-violet-600 ring-violet-200/50',
  emerald: 'bg-emerald-100/50 text-emerald-600 ring-emerald-200/50',
};

export function SectionCard({
  section,
  pending = 0,
  hasAlert = false,
}: {
  section: Section;
  pending?: number;
  hasAlert?: boolean;
}) {
  const Icon =
    (Icons as unknown as Record<string, ComponentType<{ size?: number }>>)[section.icon] ||
    Icons.Folder;

  const color =
    colorStyles[section.color as keyof typeof colorStyles] ?? colorStyles.blue;

  return (
    <Link
      to={`/sections/${section.id}`}
      className="block rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:bg-white/80 active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl ring-1 ${color}`}>
          <Icon size={30} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[20px] font-semibold tracking-tight text-slate-900">
              {section.name}
            </h3>

            {hasAlert && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[15px] font-normal leading-relaxed text-slate-500">
            {section.description}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[28px] font-bold text-slate-900">{pending}</p>
          <p className="text-[13px] font-medium text-slate-400">pend.</p>
        </div>
      </div>
    </Link>
  );
}