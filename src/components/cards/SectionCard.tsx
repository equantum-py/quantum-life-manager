import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Section } from '../../types';

const colorStyles = {
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
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
      className="block rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl ring-1 ${color}`}>
          <Icon size={28} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[18px] font-black tracking-[-0.02em] text-slate-950">
              {section.name}
            </h3>

            {hasAlert && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-slate-500">
            {section.description}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-black text-slate-950">{pending}</p>
          <p className="text-xs font-bold text-slate-400">pend.</p>
        </div>
      </div>
    </Link>
  );
}