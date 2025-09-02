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

// Seguridad y middlewares
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API bajo /api
app.use('/api/auth', authRoutes);
app.use('/api/pinchos', pinchosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/valoraciones', valoracionesRoutes);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString() });
});

module.exports = app;


