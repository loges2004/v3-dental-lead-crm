import { handleLeadItem } from '../lib/handleLeadItem.js';

/** PUT/DELETE /api/leads/item?id=... — reliable on Vercel (no dynamic [id] route). */
export default async function handler(req, res) {
  const id = req.query?.id;
  return handleLeadItem(req, res, id);
}
