import { followUpBadgeClass, followUpMeta } from '../utils/dates';

export function FollowUpBadge({ followUpDate }) {
  const meta = followUpMeta(followUpDate);
  if (meta.kind === 'none') return <span className="text-slate-400">—</span>;
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${followUpBadgeClass(meta.kind)}`}
    >
      {meta.label}
    </span>
  );
}
