require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Rutas existentes del backend
const authRoutes = require('../server/routes/auth');
const pinchosRoutes = require('../server/routes/pinchos');
const categoriasRoutes = require('../server/routes/categorias');
const valoracionesRoutes = require('../server/routes/valoraciones');

const app = express();

// Seguridad y middlewares
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (si los usas)
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// Montar rutas bajo /api
app.use('/auth', authRoutes);
app.use('/pinchos', pinchosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/valoraciones', valoracionesRoutes);

// Base and health routes
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Laureados API', ts: new Date().toISOString() });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString() });
});

// Export para Vercel serverless
const serverless = require('serverless-http');
module.exports = serverless(app);