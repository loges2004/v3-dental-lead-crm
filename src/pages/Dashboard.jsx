import { Link } from 'react-router-dom';
import { FollowUpBadge } from '../components/FollowUpBadge';
import { KpiCard } from '../components/KpiCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { useLeads } from '../hooks/useLeads';
import { STATUSES } from '../utils/constants';
import { formatDisplayDate } from '../utils/dates';
import { GoogleCalendarPanel } from '../components/GoogleCalendarPanel';
import { computeDashboardStats, sortByFollowUpPriority } from '../utils/leads';

export function DashboardPage() {
  const { leads, loading, refresh } = useLeads();
  const stats = computeDashboardStats(leads);
  const upcoming = sortByFollowUpPriority(
    leads.filter((l) => l.followUpDate && l.status !== 'Not Interested')
  ).slice(0, 8);
  const recent = [...leads]
    .sort((a, b) => new Date(b.updatedAt || b.leadDate) - new Date(a.updatedAt || a.leadDate))
    .slice(0, 8);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Live data from Google Sheets</p>
        </div>
        <button type="button" className="btn-secondary" onClick={refresh}>
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard title="Total Leads" value={stats.total} />
        <KpiCard title="Today's Follow-ups" value={stats.todayFollowUps} accent="orange" />
        <KpiCard title="Overdue Follow-ups" value={stats.overdueFollowUps} accent="red" />
        <KpiCard title="Upcoming Follow-ups" value={stats.upcomingFollowUps} accent="green" />
        <KpiCard title="Converted Appointments" value={stats.converted} accent="green" />
        <KpiCard title="Not Interested" value={stats.notInterested} accent="slate" />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Status overview</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
            >
              <StatusBadge status={status} />
              <span className="text-lg font-bold tabular-nums">{stats.statusCounts[status] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Upcoming follow-ups</h2>
            <Link to="/leads" className="text-sm text-brand-700 hover:underline dark:text-brand-400">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.length === 0 && (
              <li className="py-4 text-sm text-slate-500">No follow-ups scheduled.</li>
            )}
            {upcoming.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{lead.patientName}</p>
                  <p className="text-xs text-slate-500">{formatDisplayDate(lead.followUpDate)}</p>
                </div>
                <FollowUpBadge followUpDate={lead.followUpDate} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Recent activity</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.length === 0 && (
              <li className="py-4 text-sm text-slate-500">No leads yet.</li>
            )}
            {recent.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{lead.patientName}</p>
                  <p className="text-xs text-slate-500">
                    Lead {formatDisplayDate(lead.leadDate)} · {lead.mobileNumber}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <GoogleCalendarPanel />
    </div>
  );
}
