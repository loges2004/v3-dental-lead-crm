import { verifyCredentials, issueToken, json } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
  }
  const { username, password } = body || {};
  if (!username || !password) {
    return json(res, 400, { error: 'Username and password required' });
  }
  if (!verifyCredentials(username, password)) {
    return json(res, 401, { error: 'Invalid credentials' });
  }
  const token = issueToken(username);
  return json(res, 200, { token, username });
}
