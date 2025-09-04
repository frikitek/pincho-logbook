const { Client } = require('pg');

// Relax TLS verification (temporary) to bypass self-signed chain issues on serverless
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = async function handler(req, res) {
  console.log('Login endpoint called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      receivedMethod: req.method,
      expectedMethod: 'POST'
    });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];
    console.log('User found:', user);

    // For now, skip password validation and JWT generation
    // Just return success with user info
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ 
      success: true, 
      message: 'Login exitoso (sin validación de contraseña)',
      user: { id: user.id, email: user.email }
    });

  } catch (e) {
    console.error('Login error:', e);
    res.setHeader('Access-Control-Allow-Origin', '*');
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


