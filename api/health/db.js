import { query } from '../../../server/db/index.js';

export default async function handler(_req, res) {
  try {
    const r = await query('SELECT NOW() as now');
    res.status(200).json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}


