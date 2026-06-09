export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700 dark:border-brand-900 dark:border-t-brand-500"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
