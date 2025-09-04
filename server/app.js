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

// Rutas API sin prefijo (el prefijo /api lo añade Vercel al montar la función)
app.use('/auth', authRoutes);
app.use('/pinchos', pinchosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/valoraciones', valoracionesRoutes);

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString() });
});

module.exports = app;


