import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

const TZ = 'Asia/Kolkata';

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
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GoogleCalendarPanel() {
  const [events, setEvents] = useState([]);
  const [calendarId, setCalendarId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCalendarEvents();
      setEvents(data.events || []);
      setCalendarId(data.calendarId || '');
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

  return (
    <section className="card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Google Calendar</h2>
          <p className="text-xs text-slate-500">
            CRM creates events on the <strong>follow-up date</strong> at 9:00 AM (India time)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://calendar.google.com/calendar/u/0/r"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            Open Google Calendar
          </a>
          <button type="button" className="btn-secondary text-xs" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
        <p className="font-medium text-slate-800 dark:text-slate-100">Why you might not see events on “today”</p>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>Events appear on each lead’s <strong>Follow-up date</strong> (e.g. 10 Jun), not always today.</li>
          <li>
            In Google Calendar, open that date or use <strong>Week</strong> view and select calendar{' '}
            <strong>V3 DENTAL CLINIC</strong>.
          </li>
          <li>
            <code className="rounded bg-white px-1 dark:bg-slate-800">GOOGLE_CALENDAR_ID</code> must be the{' '}
            <strong>V3 DENTAL CLINIC</strong> calendar ID (Settings → Integrate calendar), shared with the service
            account.
          </li>
          <li>
            Old events saved at the wrong time? Edit the lead → change follow-up date → Save (recreates the event at
            9:00 AM IST).
          </li>
        </ul>
        {calendarId && (
          <p className="mt-2 text-[11px] text-slate-500">
            API calendar: <span className="font-mono">{calendarId}</span>
          </p>
        )}
      </div>

      <div className="min-h-[120px]">
        {loading && <p className="text-sm text-slate-500">Loading events…</p>}
        {!loading && error && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {error}. Share the clinic calendar with the service account (Make changes to events).
          </p>
        )}
        {!loading && !error && events.length === 0 && (
          <p className="text-sm text-slate-500">No upcoming events in the next 30 days.</p>
        )}
        {!loading && !error && events.length > 0 && (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-slate-500">{formatEventWhen(ev.start, ev.allDay)}</p>
                </div>
                {ev.link && (
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-700 hover:underline dark:text-brand-400"
                  >
                    View in Calendar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
