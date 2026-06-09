import { authenticateRequest, json } from './auth.js';
import {
  getLeadById,
  updateLeadById,
  deleteLeadById,
  createFollowUpCalendarEvent,
  deleteCalendarEvent,
} from './google.js';
import { CLINIC_BRANCHES, LEAD_SOURCES, STATUSES } from './constants.js';

export async function handleLeadItem(req, res, id) {
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    return json(res, auth.status, { error: auth.error });
  }

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
    if (!body || typeof body !== 'object') {
      return json(res, 400, { error: 'Request body required' });
    }
    if (body.status && !STATUSES.includes(body.status)) {
      return json(res, 400, { error: 'Invalid status' });
    }
    if (body.leadSource && !LEAD_SOURCES.includes(body.leadSource.trim())) {
      return json(res, 400, { error: 'Invalid lead source' });
    }
    if (body.clinicBranch && !CLINIC_BRANCHES.includes(body.clinicBranch.trim())) {
      return json(res, 400, { error: 'Invalid clinic branch' });
    }
    try {
      const before = await getLeadById(id);
      if (!before) {
        return json(res, 404, { error: 'Lead not found' });
      }

      const existing = await updateLeadById(id, body);
      const followUpChanged =
        'followUpDate' in body && (body.followUpDate || '') !== (before.followUpDate || '');

      if (followUpChanged) {
        if (before.calendarEventId) {
          await deleteCalendarEvent(before.calendarEventId);
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
