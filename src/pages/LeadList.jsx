import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FollowUpBadge } from '../components/FollowUpBadge';
import { LeadEditModal } from '../components/LeadEditModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { useLeads } from '../hooks/useLeads';
import { CLINIC_BRANCHES, STATUSES } from '../utils/constants';
import { formatDisplayDate } from '../utils/dates';
import { exportLeadsToExcel } from '../utils/exportExcel';
import { filterLeads } from '../utils/leads';

const PAGE_SIZE = 10;

const defaultFilters = {
  status: '',
  clinicBranch: '',
  followUpDate: '',
  leadDate: '',
  nameQuery: '',
  mobileQuery: '',
  sort: 'followup',
};

export function LeadListPage() {
  const { leads, loading, refresh, updateLead, deleteLead } = useLeads();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleExport = (all) => {
    const data = all ? leads : filtered;
    exportLeadsToExcel(data, all ? 'all-leads.xlsx' : 'filtered-leads.xlsx');
    toast.success('Excel file downloaded');
  };

  const handleSaveEdit = async (form) => {
    setSaving(true);
    try {
      await updateLead(form.id, {
        patientName: form.patientName,
        mobileNumber: form.mobileNumber,
        treatmentRequired: form.treatmentRequired,
        leadSource: form.leadSource,
        clinicBranch: form.clinicBranch,
        leadDate: form.leadDate,
        followUpDate: form.followUpDate,
        status: form.status,
        notes: form.notes,
      });
      toast.success('Lead updated');
      setEditing(null);
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLead(deleteTarget.id);
      toast.success('Lead deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading leads..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lead List</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={refresh}>
            Refresh
          </button>
          <button type="button" className="btn-secondary" onClick={() => handleExport(false)}>
            Export filtered
          </button>
          <button type="button" className="btn-primary" onClick={() => handleExport(true)}>
            Export all
          </button>
        </div>
      </div>

      <div className="card grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <select
          className="input-field"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input-field"
          value={filters.clinicBranch}
          onChange={(e) => setFilter('clinicBranch', e.target.value)}
        >
          <option value="">All branches</option>
          {CLINIC_BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input-field"
          value={filters.followUpDate}
          onChange={(e) => setFilter('followUpDate', e.target.value)}
          title="Follow-up date"
        />
        <input
          type="date"
          className="input-field"
          value={filters.leadDate}
          onChange={(e) => setFilter('leadDate', e.target.value)}
          title="Lead date"
        />
        <input
          className="input-field"
          placeholder="Search name"
          value={filters.nameQuery}
          onChange={(e) => setFilter('nameQuery', e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Search mobile"
          value={filters.mobileQuery}
          onChange={(e) => setFilter('mobileQuery', e.target.value)}
        />
        <select
          className="input-field"
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value)}
        >
          <option value="followup">Sort: follow-up priority</option>
          <option value="newest">Sort: newest leads</option>
          <option value="oldest">Sort: oldest leads</option>
        </select>
        <button type="button" className="btn-secondary md:col-span-2 lg:col-span-3 xl:col-span-2" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {/* Desktop table */}
      <div className="card hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
            <tr>
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Mobile</th>
              <th className="px-2 py-3">Treatment</th>
              <th className="px-2 py-3">Source</th>
              <th className="px-2 py-3">Branch</th>
              <th className="px-2 py-3">Lead Date</th>
              <th className="px-2 py-3">Follow-up</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Notes</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {slice.map((lead) => (
              <tr key={lead.id} className="align-top">
                <td className="px-2 py-3 font-medium">{lead.patientName}</td>
                <td className="px-2 py-3">{lead.mobileNumber}</td>
                <td className="px-2 py-3">{lead.treatmentRequired || '—'}</td>
                <td className="px-2 py-3">{lead.leadSource}</td>
                <td className="px-2 py-3">{lead.clinicBranch || '—'}</td>
                <td className="px-2 py-3">{formatDisplayDate(lead.leadDate)}</td>
                <td className="px-2 py-3">
                  <div className="space-y-1">
                    <div>{formatDisplayDate(lead.followUpDate)}</div>
                    <FollowUpBadge followUpDate={lead.followUpDate} />
                  </div>
                </td>
                <td className="px-2 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="max-w-[200px] truncate px-2 py-3" title={lead.notes}>
                  {lead.notes || '—'}
                </td>
                <td className="px-2 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="text-brand-700 hover:underline dark:text-brand-400" onClick={() => setEditing(lead)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => setDeleteTarget(lead)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {slice.map((lead) => (
          <article key={lead.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{lead.patientName}</h3>
                <a href={`tel:${lead.mobileNumber}`} className="text-sm text-brand-700 dark:text-brand-400">
                  {lead.mobileNumber}
                </a>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {lead.treatmentRequired || 'No treatment noted'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{lead.clinicBranch || 'Branch —'}</span>
              <span>Lead: {formatDisplayDate(lead.leadDate)}</span>
              <span>Follow-up: {formatDisplayDate(lead.followUpDate)}</span>
              <FollowUpBadge followUpDate={lead.followUpDate} />
            </div>
            {lead.notes && <p className="text-sm text-slate-600 dark:text-slate-300">{lead.notes}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={() => setEditing(lead)}>
                Edit
              </button>
              <button type="button" className="btn-secondary text-red-600" onClick={() => setDeleteTarget(lead)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500">No leads match your filters.</p>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageSafe} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <LeadEditModal
          lead={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={() => setDeleteTarget(null)} />
          <div className="relative card max-w-sm">
            <h2 className="text-lg font-semibold">Delete lead?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Remove <strong>{deleteTarget.patientName}</strong> from Google Sheets? This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1 bg-red-600 hover:bg-red-700" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
