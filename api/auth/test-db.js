import { Client } from 'pg';

export default async function handler(req, res) {
  console.log('Test DB endpoint called:', {
    method: req.method,
    url: req.url
  });

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Database connected successfully');
    
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log('Query result:', result.rows);
    
    return res.status(200).json({
      message: 'Database connection successful',
      userCount: result.rows[0].user_count,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Database test error:', e);
    return res.status(500).json({
      error: 'Database connection failed',
      detail: e.message,
      code: e.code,
      name: e.name
    });
  } finally {
    try { await client.end(); } catch {}
  }
}
