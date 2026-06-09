import { authenticateRequest, json } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    return json(res, auth.status, { error: auth.error });
  }
  return json(res, 200, { username: auth.user });
}
