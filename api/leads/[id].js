import { authenticateRequest, json } from '../lib/auth.js';
import {
  getLeadById,
  updateLeadById,
  deleteLeadById,
  createFollowUpCalendarEvent,
  deleteCalendarEvent,
} from '../lib/google.js';
import { LEAD_SOURCES, STATUSES } from '../lib/constants.js';

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    return json(res, auth.status, { error: auth.error });
  }

  const id = req.query?.id;
  if (!id) {
    return json(res, 400, { error: 'Lead id required' });
  }

  if (req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return json(res, 400, { error: 'Invalid JSON' });
      }
    }
    if (body.status && !STATUSES.includes(body.status)) {
      return json(res, 400, { error: 'Invalid status' });
    }
    if (body.leadSource && !LEAD_SOURCES.includes(body.leadSource.trim())) {
      return json(res, 400, { error: 'Invalid lead source' });
    }
    try {
      const existing = await updateLeadById(id, body);
      if (!existing) {
        return json(res, 404, { error: 'Lead not found' });
      }
      const followUpChanged = 'followUpDate' in body;
      if (followUpChanged) {
        if (existing.calendarEventId) {
          await deleteCalendarEvent(existing.calendarEventId);
        }
        let calendarEventId = '';
        if (body.followUpDate) {
          calendarEventId = (await createFollowUpCalendarEvent(existing)) || '';
        }
        const updated = await updateLeadById(id, { calendarEventId });
        return json(res, 200, { lead: updated });
      }
      return json(res, 200, { lead: existing });
    } catch (e) {
      return json(res, 500, { error: e.message || 'Failed to update lead' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await getLeadById(id);
      if (!existing) return json(res, 404, { error: 'Lead not found' });
      if (existing.calendarEventId) {
        await deleteCalendarEvent(existing.calendarEventId);
      }
      const ok = await deleteLeadById(id);
      if (!ok) return json(res, 404, { error: 'Lead not found' });
      return json(res, 200, { success: true });
    } catch (e) {
      return json(res, 500, { error: e.message || 'Failed to delete lead' });
    }
  }

  return json(res, 405, { error: 'Method not allowed' });
}
