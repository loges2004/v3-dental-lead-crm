import { json } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  return json(res, 200, { success: true });
}
