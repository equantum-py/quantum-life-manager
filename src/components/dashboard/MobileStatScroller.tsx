export function MobileStatScroller({ stats }: { stats: { label: string; value: number | string; tone: string }[] }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-3 pb-1">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[118px] rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-[13px] font-bold text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-black tracking-[-0.04em] ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
