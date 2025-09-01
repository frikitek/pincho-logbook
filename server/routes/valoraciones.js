const express = require('express');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/valoraciones/pincho/:pinchoId - Obtener valoraciones de un pincho
router.get('/pincho/:pinchoId', async (req, res) => {
  try {
    const { pinchoId } = req.params;

    const result = await query(`
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
    `, [pinchoId]);

    res.json({
      success: true,
      valoraciones: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo valoraciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/valoraciones - Crear una nueva valoración
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { pincho_id, nota, comentario } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!pincho_id || !nota) {
      return res.status(400).json({ error: 'Pincho y nota son requeridos' });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'La nota debe estar entre 1 y 5' });
    }

    // Verificar que el pincho existe
    const pinchoResult = await query(
      'SELECT id FROM pinchos WHERE id = $1',
      [pincho_id]
    );

    if (pinchoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pincho no encontrado' });
    }

    // Verificar si el usuario ya valoró este pincho hoy
    const today = new Date().toISOString().split('T')[0];
    const existingResult = await query(`
      SELECT id FROM valoraciones 
      WHERE pincho_id = $1 AND user_id = $2 AND DATE(fecha) = $3
    `, [pincho_id, user_id, today]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Ya has valorado este pincho hoy' });
    }

    // Crear valoración
    const result = await query(`
      INSERT INTO valoraciones (pincho_id, user_id, nota, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING id, pincho_id, nota, comentario, fecha
    `, [pincho_id, user_id, nota, comentario || null]);

    res.status(201).json({
      success: true,
      valoracion: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando valoración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/valoraciones/can-rate/:pinchoId - Verificar si el usuario puede valorar
router.get('/can-rate/:pinchoId', authenticateToken, async (req, res) => {
  try {
    const { pinchoId } = req.params;
    const user_id = req.user.id;

    // Verificar si el usuario ya valoró este pincho hoy
    const today = new Date().toISOString().split('T')[0];
    const existingResult = await query(`
      SELECT id FROM valoraciones 
      WHERE pincho_id = $1 AND user_id = $2 AND DATE(fecha) = $3
    `, [pinchoId, user_id, today]);

    const canRate = existingResult.rows.length === 0;

    res.json({
      success: true,
      canRate
    });

  } catch (error) {
    console.error('Error verificando si puede valorar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/valoraciones/:id - Actualizar una valoración
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    const user_id = req.user.id;

    // Validaciones
    if (!nota) {
      return res.status(400).json({ error: 'Nota es requerida' });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'La nota debe estar entre 1 y 5' });
    }

    // Verificar que la valoración existe y pertenece al usuario
    const existingResult = await query(`
      SELECT id FROM valoraciones 
      WHERE id = $1 AND user_id = $2
    `, [id, user_id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    // Actualizar valoración
    const result = await query(`
      UPDATE valoraciones 
      SET nota = $1, comentario = $2
      WHERE id = $3 AND user_id = $4
      RETURNING id, pincho_id, nota, comentario, fecha
    `, [nota, comentario || null, id, user_id]);

    res.json({
      success: true,
      valoracion: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando valoración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/valoraciones/:id - Eliminar una valoración
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verificar que la valoración existe y pertenece al usuario
    const existingResult = await query(`
      SELECT id FROM valoraciones 
      WHERE id = $1 AND user_id = $2
    `, [id, user_id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    // Eliminar valoración
    await query('DELETE FROM valoraciones WHERE id = $1 AND user_id = $2', [id, user_id]);

    res.json({
      success: true,
      message: 'Valoración eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando valoración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
