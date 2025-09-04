import { Client } from 'pg';

// Relax TLS verification (temporary) to bypass self-signed chain issues on serverless
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(_req, res) {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 5000,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const r = await client.query('SELECT NOW() as now');
    res.status(200).json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code, name: e.name });
  } finally {
    try { await client.end(); } catch {}
  }
}