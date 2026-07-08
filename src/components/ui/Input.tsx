import { InputHTMLAttributes } from 'react';

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
        className={`min-h-[48px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${className}`}
      {...props}
    />
  );
}