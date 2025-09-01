const express = require('express');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/categorias - Obtener todas las categorías ordenadas por nivel
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nombre, color, nivel FROM categorias ORDER BY nivel ASC'
    );

    res.json({
      success: true,
      categorias: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/categorias/:id - Obtener una categoría específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, nombre, color, nivel FROM categorias WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      success: true,
      categoria: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/categorias/:id - Actualizar una categoría
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, color, nivel } = req.body;

    // Validaciones
    if (!nombre || !color || nivel === undefined) {
      return res.status(400).json({ error: 'Nombre, color y nivel son requeridos' });
    }

    if (nivel < 1 || nivel > 10) {
      return res.status(400).json({ error: 'El nivel debe estar entre 1 y 10' });
    }

    // Verificar que la categoría existe
    const existingResult = await query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Actualizar categoría
    const result = await query(
      'UPDATE categorias SET nombre = $1, color = $2, nivel = $3 WHERE id = $4 RETURNING id, nombre, color, nivel',
      [nombre, color, nivel, id]
    );

    res.json({
      success: true,
      categoria: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/categorias - Crear una nueva categoría
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, color, nivel } = req.body;

    // Validaciones
    if (!nombre || !color || nivel === undefined) {
      return res.status(400).json({ error: 'Nombre, color y nivel son requeridos' });
    }

    if (nivel < 1 || nivel > 10) {
      return res.status(400).json({ error: 'El nivel debe estar entre 1 y 10' });
    }

    // Crear categoría
    const result = await query(
      'INSERT INTO categorias (nombre, color, nivel) VALUES ($1, $2, $3) RETURNING id, nombre, color, nivel',
      [nombre, color, nivel]
    );

    res.status(201).json({
      success: true,
      categoria: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/categorias/:id - Eliminar una categoría
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const existingResult = await query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si hay pinchos usando esta categoría
    const pinchosResult = await query(
      'SELECT COUNT(*) as count FROM pinchos WHERE categoria_id = $1',
      [id]
    );

    if (parseInt(pinchosResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque hay pinchos que la usan' 
      });
    }

    // Eliminar categoría
    await query('DELETE FROM categorias WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Categoría eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
