import { useState } from 'react';
import toast from 'react-hot-toast';
import { LeadForm } from '../components/LeadForm';
import { useLeads } from '../hooks/useLeads';

export function AddLeadPage() {
  const { createLead } = useLeads();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form, { reset }) => {
    setSubmitting(true);
    try {
      await createLead(form);
      toast.success('Lead saved to Google Sheets');
      reset();
    } catch (e) {
      toast.error(e.message || 'Failed to save lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Add Lead</h1>
        <p className="text-sm text-slate-500">
          Fast entry during phone calls — use Save &amp; New for the next patient.
        </p>
      </div>
      <LeadForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Save & New" />
    </div>
  );
}
