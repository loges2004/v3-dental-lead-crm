import { authenticateRequest, json } from '../lib/auth.js';
import { fetchUpcomingCalendarEvents } from '../lib/google.js';

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    return json(res, auth.status, { error: auth.error });
  }

  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const events = await fetchUpcomingCalendarEvents();
    return json(res, 200, { events });
  } catch (e) {
    return json(res, 500, { error: e.message || 'Failed to load calendar events' });
  }
}
