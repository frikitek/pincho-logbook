import { Client } from 'pg';

// Relax TLS verification (temporary) to bypass self-signed chain issues on serverless
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(req, res) {
  console.log('Simple login endpoint called:', {
    method: req.method,
    url: req.url,
    body: req.body
  });

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      receivedMethod: req.method,
      expectedMethod: 'POST'
    });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const connectionString = process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 5000,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('Database connected successfully');
    
    // Simple test - just check if user exists
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    console.log('User found:', user);

    // For now, just return success without password validation
    return res.status(200).json({ 
      success: true, 
      message: 'Login simple exitoso',
      user: { id: user.id, email: user.email }
    });

  } catch (e) {
    console.error('Simple login error:', e);
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      detail: e.message,
      code: e.code,
      name: e.name
    });
  } finally {
    try { await client.end(); } catch {}
  }
}
