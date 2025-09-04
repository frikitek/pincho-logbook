const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Rutas
const authRoutes = require('./routes/auth');
const pinchosRoutes = require('./routes/pinchos');
const categoriasRoutes = require('./routes/categorias');
const valoracionesRoutes = require('./routes/valoraciones');

const app = express();
const { query } = require('./db');

// Seguridad y middlewares
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API con prefijo /api (Vercel mantiene el path completo)
app.use('/api/auth', authRoutes);
app.use('/api/pinchos', pinchosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/valoraciones', valoracionesRoutes);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString() });
});

// DB health
app.get('/api/health/db', async (_req, res) => {
  try {
    const r = await query('SELECT NOW() as now');
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Schema diagnostics
app.get('/api/health/schema', async (_req, res) => {
  try {
    const tables = await query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    const out = { tables: tables.rows.map(r => r.table_name) };
    // Optional counts
    const tryCount = async (name) => {
      try { const r = await query(`SELECT COUNT(*)::int AS count FROM ${name}`); return r.rows[0].count; } catch { return null; }
    };
    out.categorias = await tryCount('categorias');
    out.pinchos = await tryCount('pinchos');
    out.valoraciones = await tryCount('valoraciones');
    out.users = await tryCount('users');
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;


