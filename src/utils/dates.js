export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function parseDateOnly(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function followUpMeta(followUpDate) {
  const date = parseDateOnly(followUpDate);
  if (!date) return { kind: 'none', label: '—', days: null };
  const today = startOfToday();
  const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) {
    return { kind: 'overdue', label: `${Math.abs(diff)}d overdue`, days: diff };
  }
  if (diff === 0) {
    return { kind: 'today', label: 'Today', days: 0 };
  }
  return { kind: 'upcoming', label: `In ${diff}d`, days: diff };
}

export function followUpBadgeClass(kind) {
  switch (kind) {
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800';
    case 'today':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-800';
    case 'upcoming':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-800';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }
}

export function formatDisplayDate(iso) {
  const d = parseDateOnly(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
