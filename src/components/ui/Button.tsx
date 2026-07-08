import { ButtonHTMLAttributes } from 'react';

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`tap inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-6 py-2.5 text-[15px] font-black text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}