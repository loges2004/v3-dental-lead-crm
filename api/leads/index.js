import { authenticateRequest, json } from '../lib/auth.js';
import {
  fetchAllLeads,
  appendLead,
  createFollowUpCalendarEvent,
  updateLeadById,
} from '../lib/google.js';
import {
  CLINIC_BRANCHES,
  DEFAULT_CLINIC_BRANCH,
  DEFAULT_LEAD_SOURCE,
  LEAD_SOURCES,
  STATUSES,
} from '../lib/constants.js';

function normalizeLeadSource(value) {
  const trimmed = value?.trim();
  if (trimmed && LEAD_SOURCES.includes(trimmed)) return trimmed;
  return DEFAULT_LEAD_SOURCE;
}

function normalizeClinicBranch(value) {
  const trimmed = value?.trim();
  if (trimmed && CLINIC_BRANCHES.includes(trimmed)) return trimmed;
  return DEFAULT_CLINIC_BRANCH;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    return json(res, auth.status, { error: auth.error });
  }

  if (req.method === 'GET') {
    try {
      const leads = await fetchAllLeads();
      return json(res, 200, { leads });
    } catch (e) {
      return json(res, 500, { error: e.message || 'Failed to fetch leads' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return json(res, 400, { error: 'Invalid JSON' });
      }
    }
    const { patientName, mobileNumber } = body || {};
    if (!patientName?.trim() || !mobileNumber?.trim()) {
      return json(res, 400, { error: 'Patient name and mobile number are required' });
    }
    const status = body.status && STATUSES.includes(body.status) ? body.status : 'New Lead';
    const lead = {
      patientName: patientName.trim(),
      mobileNumber: mobileNumber.trim(),
      treatmentRequired: body.treatmentRequired?.trim() || '',
      leadSource: normalizeLeadSource(body.leadSource),
      clinicBranch: normalizeClinicBranch(body.clinicBranch),
      leadDate: body.leadDate || todayISO(),
      followUpDate: body.followUpDate || '',
      status,
      notes: body.notes?.trim() || '',
      calendarEventId: '',
    };
    try {
      if (lead.followUpDate) {
        lead.calendarEventId = (await createFollowUpCalendarEvent(lead)) || '';
      }
      const saved = await appendLead(lead);
      return json(res, 201, { lead: saved });
    } catch (e) {
      return json(res, 500, { error: e.message || 'Failed to save lead' });
    }
  }

  return json(res, 405, { error: 'Method not allowed' });
}
