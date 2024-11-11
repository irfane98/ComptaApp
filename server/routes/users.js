import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import db from '../db/init.js';

const router = express.Router();

// Obtenir le profil de l'utilisateur connecté
router.get('/profile', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, preferences, created_at, updated_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (user.preferences) {
      user.preferences = JSON.parse(user.preferences);
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// Mettre à jour le profil
router.put('/profile', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('currentPassword').optional().isLength({ min: 6 }),
  body('newPassword').optional().isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, currentPassword, newPassword, preferences } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (preferences) {
      updates.push('preferences = ?');
      params.push(JSON.stringify(preferences));
    }

    // Si changement de mot de passe
    if (currentPassword && newPassword) {
      const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!validPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      updates.push('password = ?');
      params.push(await bcrypt.hash(newPassword, 10));
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      db.prepare(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);

      const updatedUser = db.prepare(`
        SELECT id, email, name, role, preferences, updated_at
        FROM users WHERE id = ?
      `).get(req.user.id);

      if (updatedUser.preferences) {
        updatedUser.preferences = JSON.parse(updatedUser.preferences);
      }

      res.json({
        success: true,
        user: updatedUser
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

export default router;