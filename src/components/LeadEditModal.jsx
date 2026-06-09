import { useState } from 'react';
import {
  CLINIC_BRANCHES,
  DEFAULT_CLINIC_BRANCH,
  LEAD_SOURCES,
  STATUSES,
} from '../utils/constants';

export function LeadEditModal({ lead, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    ...lead,
    clinicBranch: lead.clinicBranch || DEFAULT_CLINIC_BRANCH,
  });
  const sourceOptions =
    form.leadSource && !LEAD_SOURCES.includes(form.leadSource)
      ? [...LEAD_SOURCES, form.leadSource]
      : LEAD_SOURCES;
  const branchOptions =
    form.clinicBranch && !CLINIC_BRANCHES.includes(form.clinicBranch)
      ? [...CLINIC_BRANCHES, form.clinicBranch]
      : CLINIC_BRANCHES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Edit Lead</h2>
        <p className="text-sm text-slate-500">{lead.patientName}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Patient Name</label>
            <input
              name="patientName"
              className="input-field mt-1"
              value={form.patientName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mobile</label>
            <input
              name="mobileNumber"
              className="input-field mt-1"
              value={form.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Treatment</label>
            <input
              name="treatmentRequired"
              className="input-field mt-1"
              value={form.treatmentRequired}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Lead Source</label>
            <select name="leadSource" className="input-field mt-1" value={form.leadSource} onChange={handleChange}>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Clinic Branch</label>
            <select
              name="clinicBranch"
              className="input-field mt-1"
              value={form.clinicBranch}
              onChange={handleChange}
            >
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Lead Date</label>
              <input
                name="leadDate"
                type="date"
                className="input-field mt-1"
                value={form.leadDate || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Follow-up Date</label>
              <input
                name="followUpDate"
                type="date"
                className="input-field mt-1"
                value={form.followUpDate || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select name="status" className="input-field mt-1" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="input-field mt-1"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
