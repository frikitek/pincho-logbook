import { Pool } from 'pg';

export default async function handler(_req, res) {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 3000,
  });

  try {
    const r = await pool.query('SELECT NOW() as now');
    res.status(200).json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    await pool.end().catch(() => {});
  }
}