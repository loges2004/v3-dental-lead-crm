import { STATUS_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
