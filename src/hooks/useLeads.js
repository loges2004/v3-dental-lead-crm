import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export function useLeads({ autoFetch = true } = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { leads: data } = await api.getLeads();
      setLeads(data || []);
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) refresh();
  }, [autoFetch, refresh]);

  const createLead = async (payload) => {
    const { lead } = await api.createLead(payload);
    setLeads((prev) => [lead, ...prev]);
    return lead;
  };

  const updateLead = async (id, payload) => {
    const { lead } = await api.updateLead(id, payload);
    setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
    return lead;
  };

  const deleteLead = async (id) => {
    await api.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return { leads, loading, error, refresh, createLead, updateLead, deleteLead };
}
