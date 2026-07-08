import { AlertTriangle, CheckCircle2, Info, Siren } from 'lucide-react';
import { AppAlert } from '../../types';
import { prettyDate } from '../../utils/dates';

const styles = {
  red: {
    wrap: 'border-red-100 bg-red-50',
    icon: 'bg-red-600 text-white',
    label: 'text-red-700',
    Icon: Siren,
    name: 'Urgente',
  },
  yellow: {
    wrap: 'border-amber-100 bg-amber-50',
    icon: 'bg-amber-500 text-white',
    label: 'text-amber-700',
    Icon: AlertTriangle,
    name: 'Advertencia',
  },
  blue: {
    wrap: 'border-blue-100 bg-blue-50',
    icon: 'bg-blue-600 text-white',
    label: 'text-blue-700',
    Icon: Info,
    name: 'Info',
  },
  green: {
    wrap: 'border-green-100 bg-green-50',
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
    <article className={`rounded-[1.75rem] border p-5 ${style.wrap}`}>
      <div className="flex gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${style.icon}`}>
          <Icon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs font-black uppercase tracking-wide ${style.label}`}>
              {style.name}
            </p>

            <span className="shrink-0 text-xs font-bold text-slate-500">
              {prettyDate(alert.date)}
            </span>
          </div>

          <h3 className="mt-1 text-[18px] font-black tracking-[-0.02em] text-slate-950">
            {alert.title}
          </h3>

          <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
            {alert.description}
          </p>

          <p className="mt-3 text-sm font-black text-slate-900">
            Acción: {alert.action}
          </p>
        </div>
      </div>
    </article>
  );
}