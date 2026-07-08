import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export function QuickActionButton({ to, icon: Icon, label, tone }: { to: string; icon: LucideIcon; label: string; tone: string }) {
  return (
    <Link to={to} className="flex min-h-[96px] flex-col justify-between rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 active:scale-[0.99]">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
        <Icon size={23} />
      </span>
      <span className="text-[15px] font-black leading-tight text-slate-950">{label}</span>
    </Link>
  );
}
