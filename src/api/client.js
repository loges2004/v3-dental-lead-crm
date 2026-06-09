const TOKEN_KEY = 'dental_crm_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new Error(
      'Cannot reach API. Run: npm run dev:all (or npm run dev:api in a second terminal).'
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  getLeads: () => request('/api/leads'),
  createLead: (payload) => request('/api/leads', { method: 'POST', body: JSON.stringify(payload) }),
  updateLead: (id, payload) =>
    request(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteLead: (id) =>
    request(`/api/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
