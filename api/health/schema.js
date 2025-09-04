import { Client } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(_req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 5000,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );

    const count = async (name) => {
      try {
        const r = await client.query(`SELECT COUNT(*)::int AS count FROM ${name}`);
        return r.rows[0].count;
      } catch {
        return null;
      }
    };

    res.status(200).json({
      tables: tables.rows.map((r) => r.table_name),
      categorias: await count('categorias'),
      pinchos: await count('pinchos'),
      valoraciones: await count('valoraciones'),
      users: await count('users'),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    try {
      await client.end();
    } catch {}
  }
}


