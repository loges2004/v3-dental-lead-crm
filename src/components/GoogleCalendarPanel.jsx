import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const DEFAULT_CALENDAR_ID = 'v3dentalclinic@gmail.com';

function formatEventWhen(start, allDay) {
  if (!start) return '—';
  if (allDay) {
    const [y, m, d] = start.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  const dt = new Date(start);
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GoogleCalendarPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { events: data } = await api.getCalendarEvents();
      setEvents(data || []);
    } catch (e) {
      setError(e.message || 'Could not load calendar');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const embedSrc = useMemo(() => {
    const id = import.meta.env.VITE_CALENDAR_EMBED_ID || DEFAULT_CALENDAR_ID;
    const params = new URLSearchParams({
      src: id,
      ctz: 'Asia/Kolkata',
      mode: 'AGENDA',
      showTitle: '0',
      showNav: '1',
      height: '420',
    });
    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  }, []);

  return (
    <section className="card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Google Calendar</h2>
          <p className="text-xs text-slate-500">V3 clinic follow-ups &amp; reminders (next 30 days)</p>
        </div>
        <button type="button" className="btn-secondary text-xs" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh calendar'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-h-[200px]">
          {loading && <p className="text-sm text-slate-500">Loading events…</p>}
          {!loading && error && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {error}. Check calendar is shared with the service account and Calendar API is enabled.
            </p>
          )}
          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-slate-500">No upcoming events on this calendar.</p>
          )}
          {!loading && !error && events.length > 0 && (
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {events.map((ev) => (
                <li key={ev.id} className="py-3 pr-1">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-slate-500">{formatEventWhen(ev.start, ev.allDay)}</p>
                  {ev.link && (
                    <a
                      href={ev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-brand-700 hover:underline dark:text-brand-400"
                    >
                      Open in Google Calendar
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <iframe
            title="V3 Dental Clinic Google Calendar"
            src={embedSrc}
            className="h-[420px] w-full border-0 bg-white"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
