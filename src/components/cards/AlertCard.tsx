import { AlertTriangle, CheckCircle2, Info, Siren } from 'lucide-react';
import { AppAlert } from '../../types';
import { prettyDate } from '../../utils/dates';

const styles = {
  red: {
    wrap: 'border-red-200/50 bg-red-50/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl',
    icon: 'bg-red-600 text-white',
    label: 'text-red-700',
    Icon: Siren,
    name: 'Urgente',
  },
  yellow: {
    wrap: 'border-amber-200/50 bg-amber-50/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl',
    icon: 'bg-amber-500 text-white',
    label: 'text-amber-700',
    Icon: AlertTriangle,
    name: 'Advertencia',
  },
  blue: {
    wrap: 'border-blue-200/50 bg-blue-50/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl',
    icon: 'bg-blue-600 text-white',
    label: 'text-blue-700',
    Icon: Info,
    name: 'Info',
  },
  green: {
    wrap: 'border-green-200/50 bg-green-50/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl',
    icon: 'bg-green-600 text-white',
    label: 'text-green-700',
    Icon: CheckCircle2,
    name: 'OK',
  },
};

export function AlertCard({ alert }: { alert: AppAlert }) {
  const style = styles[alert.level];
  const Icon = style.Icon;

  return (
    <article className={`rounded-[28px] border p-6 ${style.wrap}`}>
      <div className="flex gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl ${style.icon}`}>
          <Icon size={28} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs font-bold uppercase tracking-wide ${style.label}`}>
              {style.name}
            </p>

            <span className="shrink-0 text-xs font-bold text-slate-500">
              {prettyDate(alert.date)}
            </span>
          </div>

          <h3 className="mt-1 text-[20px] font-bold tracking-tight text-slate-900">
            {alert.title}
          </h3>

          <p className="mt-1 text-[16px] font-normal leading-relaxed text-slate-600">
            {alert.description}
          </p>

          <p className="mt-3 text-sm font-bold text-slate-900">
            Acción: {alert.action}
          </p>
        </div>
      </div>
    </article>
  );
}