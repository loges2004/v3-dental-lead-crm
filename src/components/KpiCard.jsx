export function KpiCard({ title, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/50',
    red: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
    orange: 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40',
    green: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40',
    slate: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50',
  };
  return (
    <div className={`card border-l-4 ${accents[accent] || accents.brand}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
