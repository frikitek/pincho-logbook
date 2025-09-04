const express = require('express');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/pinchos - Obtener todos los pinchos con sus categorías y valoraciones
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.nombre,
        p.bar,
        p.precio,
        p.foto_url,
        p.created_at,
        p.updated_at,
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        c.color as categoria_color,
        c.nivel as categoria_nivel,
        COALESCE(AVG(v.nota), 0) as promedio_valoracion,
        COUNT(v.id) as total_valoraciones
      FROM pinchos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN valoraciones v ON p.id = v.pincho_id
      GROUP BY p.id, c.id
      ORDER BY p.created_at DESC
    `);

    // Obtener valoraciones para cada pincho
    const pinchos = await Promise.all(
      result.rows.map(async (pincho) => {
        const valoracionesResult = await query(`
          SELECT 
            v.id,
            v.nota,
            v.comentario,
            v.fecha,
            u.email as usuario
          FROM valoraciones v
          JOIN users u ON v.user_id = u.id
          WHERE v.pincho_id = $1
          ORDER BY v.fecha DESC
        `, [pincho.id]);

        return {
          ...pincho,
          valoraciones: valoracionesResult.rows,
          promedio_valoracion: parseFloat(pincho.promedio_valoracion).toFixed(1)
        };
      })
    );

    res.json({
      success: true,
      pinchos
    });

  } catch (error) {
    console.error('Error obteniendo pinchos:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
});

// GET /api/pinchos/:id - Obtener un pincho específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        p.id,
        p.nombre,
        p.bar,
        p.precio,
        p.foto_url,
        p.created_at,
        p.updated_at,
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        c.color as categoria_color,
        c.nivel as categoria_nivel
      FROM pinchos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pincho no encontrado' });
    }

    const pincho = result.rows[0];

    // Obtener valoraciones
    const valoracionesResult = await query(`
      SELECT 
        v.id,
        v.nota,
        v.comentario,
        v.fecha,
        u.email as usuario
      FROM valoraciones v
      JOIN users u ON v.user_id = u.id
      WHERE v.pincho_id = $1
      ORDER BY v.fecha DESC
    `, [id]);

    pincho.valoraciones = valoracionesResult.rows;

    res.json({
      success: true,
      pincho
    });

  } catch (error) {
    console.error('Error obteniendo pincho:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
});

// POST /api/pinchos - Crear un nuevo pincho
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, bar, precio, categoria_id, foto_url } = req.body;

    // Validaciones
    if (!nombre || !bar || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Nombre, bar, precio y categoría son requeridos' });
    }

    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    // Verificar que la categoría existe
    const categoriaResult = await query(
      'SELECT id FROM categorias WHERE id = $1',
      [categoria_id]
    );

    if (categoriaResult.rows.length === 0) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Crear pincho
    const result = await query(`
      INSERT INTO pinchos (nombre, bar, precio, categoria_id, foto_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, bar, precio, categoria_id, foto_url, created_at
    `, [nombre, bar, precio, categoria_id, foto_url || null]);

    res.status(201).json({
      success: true,
      pincho: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando pincho:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
});

// PUT /api/pinchos/:id - Actualizar un pincho
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, bar, precio, categoria_id, foto_url } = req.body;

    // Validaciones
    if (!nombre || !bar || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Nombre, bar, precio y categoría son requeridos' });
    }

    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    // Verificar que el pincho existe
    const existingResult = await query(
      'SELECT id FROM pinchos WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pincho no encontrado' });
    }

    // Verificar que la categoría existe
    const categoriaResult = await query(
      'SELECT id FROM categorias WHERE id = $1',
      [categoria_id]
    );

    if (categoriaResult.rows.length === 0) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Actualizar pincho
    const result = await query(`
      UPDATE pinchos 
      SET nombre = $1, bar = $2, precio = $3, categoria_id = $4, foto_url = $5
      WHERE id = $6
      RETURNING id, nombre, bar, precio, categoria_id, foto_url, updated_at
    `, [nombre, bar, precio, categoria_id, foto_url || null, id]);

    res.json({
      success: true,
      pincho: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando pincho:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
});

// DELETE /api/pinchos/:id - Eliminar un pincho
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el pincho existe
    const existingResult = await query(
      'SELECT id FROM pinchos WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pincho no encontrado' });
    }

    // Eliminar pincho (las valoraciones se eliminan automáticamente por CASCADE)
    await query('DELETE FROM pinchos WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Pincho eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando pincho:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
});

module.exports = router;
