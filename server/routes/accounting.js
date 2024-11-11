import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomUUID } from 'crypto';
import db from '../db/init.js';

const router = express.Router();

// Récupérer toutes les transactions
router.get('/transactions', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(req.user.id);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transactions'
    });
  }
});

// Créer une nouvelle transaction
router.post('/transactions', [
  body('date').isISO8601(),
  body('description').trim().notEmpty(),
  body('amount').isNumeric(),
  body('type').isIn(['income', 'expense'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { date, description, amount, type } = req.body;
    const id = randomUUID();

    const transaction = db.prepare(`
      INSERT INTO transactions (id, date, description, amount, type, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(id, date, description, amount, type, req.user.id);

    // Émettre un événement WebSocket pour la mise à jour en temps réel
    req.app.get('io').to(`user-${req.user.id}`).emit('transactionCreated', transaction);

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la transaction'
    });
  }
});

// Mettre à jour une transaction
router.put('/transactions/:id', [
  body('date').optional().isISO8601(),
  body('description').optional().trim().notEmpty(),
  body('amount').optional().isNumeric(),
  body('type').optional().isIn(['income', 'expense'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const updates = [];
    const params = [];

    Object.entries(req.body).forEach(([key, value]) => {
      if (['date', 'description', 'amount', 'type'].includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    params.push(req.params.id, req.user.id);

    const transaction = db.prepare(`
      UPDATE transactions 
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
      RETURNING *
    `).get(...params);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Émettre un événement WebSocket pour la mise à jour en temps réel
    req.app.get('io').to(`user-${req.user.id}`).emit('transactionUpdated', transaction);

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la transaction'
    });
  }
});

// Supprimer une transaction
router.delete('/transactions/:id', (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM transactions 
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Émettre un événement WebSocket pour la mise à jour en temps réel
    req.app.get('io').to(`user-${req.user.id}`).emit('transactionDeleted', req.params.id);

    res.json({
      success: true,
      message: 'Transaction supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la transaction'
    });
  }
});

export default router;