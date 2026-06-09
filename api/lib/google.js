import { google } from 'googleapis';
import { SHEET_HEADERS } from './constants.js';

const SHEET_NAME = 'Leads';

function getCredentials() {
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonRaw) {
    try {
      const parsed = typeof jsonRaw === 'string' ? JSON.parse(jsonRaw) : jsonRaw;
      const privateKey = parsed.private_key?.replace(/\\n/g, '\n');
      if (parsed.client_email && privateKey) {
        return { client_email: parsed.client_email, private_key: privateKey };
      }
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (!email || !privateKey) {
    throw new Error(
      'Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY'
    );
  }
  return { client_email: email, private_key: privateKey };
}

function normalizeSheetId(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const fromUrl = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl) return fromUrl[1];
  return trimmed;
}

function getSheetId() {
  const id = normalizeSheetId(process.env.GOOGLE_SHEET_ID);
  if (!id) throw new Error('Missing GOOGLE_SHEET_ID');
  return id;
}

export function getAuth(scopes) {
  const creds = getCredentials();
  const auth = new google.auth.JWT(creds.client_email, null, creds.private_key, scopes);
  return auth;
}

export async function getSheetsClient() {
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  return google.sheets({ version: 'v4', auth });
}

export async function getCalendarClient() {
  const auth = getAuth(['https://www.googleapis.com/auth/calendar']);
  return google.calendar({ version: 'v3', auth });
}

export async function ensureSheetHeaders() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === SHEET_NAME);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
  }
  const headerRange = `${SHEET_NAME}!A1:L1`;
  const current = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const headers = current.data.values?.[0] || [];
  if (!headers.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_HEADERS] },
    });
  } else if (!headers.includes('clinicBranch')) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!L1`,
      valueInputOption: 'RAW',
      requestBody: { values: [['clinicBranch']] },
    });
  }
}

function rowToLead(row) {
  const obj = {};
  SHEET_HEADERS.forEach((key, i) => {
    obj[key] = row[i] ?? '';
  });
  return obj;
}

export async function fetchAllLeads() {
  await ensureSheetHeaders();
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();
  const range = `${SHEET_NAME}!A2:L`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0])
    .map(rowToLead)
    .sort((a, b) => new Date(b.leadDate || 0) - new Date(a.leadDate || 0));
}

export async function appendLead(lead) {
  await ensureSheetHeaders();
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();
  const id = lead.id || `lead_${Date.now()}`;
  const now = new Date().toISOString();
  const row = SHEET_HEADERS.map((h) => {
    if (h === 'id') return id;
    if (h === 'updatedAt') return now;
    return lead[h] ?? '';
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  return { ...lead, id, updatedAt: now };
}

export async function getLeadById(id) {
  const leads = await fetchAllLeads();
  return leads.find((l) => l.id === id) || null;
}

export async function updateLeadById(id, updates) {
  await ensureSheetHeaders();
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();
  const range = `${SHEET_NAME}!A2:L`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  const index = rows.findIndex((row) => row[0] === id);
  if (index === -1) return null;
  const existing = rowToLead(rows[index]);
  const merged = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
  const rowNum = index + 2;
  const newRow = SHEET_HEADERS.map((h) => merged[h] ?? '');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowNum}:L${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [newRow] },
  });
  return merged;
}

export async function deleteLeadById(id) {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
  if (!sheet) return false;
  const sheetId = sheet.properties.sheetId;
  const range = `${SHEET_NAME}!A2:L`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  const index = rows.findIndex((row) => row[0] === id);
  if (index === -1) return false;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: index + 1,
              endIndex: index + 2,
            },
          },
        },
      ],
    },
  });
  return true;
}

export async function createFollowUpCalendarEvent(lead) {
  if (!lead.followUpDate) return null;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const calendar = await getCalendarClient();
  const start = new Date(`${lead.followUpDate}T09:00:00`);
  const end = new Date(start);
  end.setHours(10);
  const event = {
    summary: `Follow-up: ${lead.patientName}`,
    description: [
      `Mobile: ${lead.mobileNumber}`,
      `Treatment: ${lead.treatmentRequired || '—'}`,
      `Status: ${lead.status}`,
      lead.notes ? `Notes: ${lead.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
    end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 },
        { method: 'popup', minutes: 0 },
      ],
    },
  };
  const created = await calendar.events.insert({ calendarId, requestBody: event });
  return created.data.id;
}

export async function deleteCalendarEvent(eventId) {
  if (!eventId) return;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const calendar = await getCalendarClient();
  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch {
    /* ignore missing events */
  }
}
