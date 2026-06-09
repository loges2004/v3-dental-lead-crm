import { useEffect, useRef, useState } from 'react';
import {
  CLINIC_BRANCHES,
  DEFAULT_CLINIC_BRANCH,
  DEFAULT_LEAD_SOURCE,
  LEAD_SOURCES,
  STATUSES,
} from '../utils/constants';
import { todayISO } from '../utils/dates';

const emptyForm = () => ({
  patientName: '',
  mobileNumber: '',
  treatmentRequired: '',
  leadSource: DEFAULT_LEAD_SOURCE,
  clinicBranch: DEFAULT_CLINIC_BRANCH,
  leadDate: todayISO(),
  followUpDate: '',
  status: 'New Lead',
  notes: '',
});

export function LeadForm({ onSubmit, submitting, submitLabel = 'Save & New' }) {
  const [form, setForm] = useState(emptyForm);
  const nameRef = useRef(null);

  const reset = () => {
    setForm(emptyForm());
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const openDatePicker = (e) => {
    if (typeof e.target.showPicker === 'function') {
      try {
        e.target.showPicker();
      } catch {
        /* ignore if browser blocks showPicker */
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form, { reset });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="patientName">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            ref={nameRef}
            id="patientName"
            name="patientName"
            className="input-field"
            value={form.patientName}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="mobileNumber">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            className="input-field"
            value={form.mobileNumber}
            onChange={handleChange}
            required
            inputMode="tel"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="treatmentRequired">
            Treatment Required
          </label>
          <input
            id="treatmentRequired"
            name="treatmentRequired"
            className="input-field"
            value={form.treatmentRequired}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="leadSource">
            Lead Source
          </label>
          <select
            id="leadSource"
            name="leadSource"
            className="input-field"
            value={form.leadSource}
            onChange={handleChange}
          >
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="clinicBranch">
            Clinic Branch
          </label>
          <select
            id="clinicBranch"
            name="clinicBranch"
            className="input-field"
            value={form.clinicBranch}
            onChange={handleChange}
            required
          >
            {CLINIC_BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="leadDate">
            Lead Date
          </label>
          <input
            id="leadDate"
            name="leadDate"
            type="date"
            className="input-field input-date"
            value={form.leadDate}
            onChange={handleChange}
            onClick={openDatePicker}
            onFocus={openDatePicker}
            aria-label="Lead date"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="followUpDate">
            Follow-up Date
          </label>
          <input
            id="followUpDate"
            name="followUpDate"
            type="date"
            className="input-field input-date"
            value={form.followUpDate}
            onChange={handleChange}
            onClick={openDatePicker}
            onFocus={openDatePicker}
            aria-label="Follow-up date"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input-field"
            value={form.status}
            onChange={handleChange}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium" htmlFor="notes">
            Notes / Remarks
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="input-field"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary min-h-[44px] min-w-[140px]" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
