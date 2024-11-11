import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomUUID } from 'crypto';
import db from '../db/init.js';

const router = express.Router();

// Récupérer le plan comptable
router.get('/', (req, res) => {
  try {
    const accounts = db.prepare(`
      SELECT * FROM accounts 
      WHERE user_id = ? 
      ORDER BY code ASC
    `).all(req.user.id);

    // Organiser les comptes en arborescence
    const accountTree = accounts.reduce((tree, account) => {
      const level = account.code.length === 1 ? 'class' :
                   account.code.length === 2 ? 'account' : 'subaccount';
      
      if (level === 'class') {
        tree[account.code] = { ...account, type: level, children: {} };
      } else if (level === 'account') {
        const classCode = account.code[0];
        if (tree[classCode]) {
          tree[classCode].children[account.code] = { ...account, type: level, children: {} };
        }
      } else {
        const classCode = account.code[0];
        const accountCode = account.code.substring(0, 2);
        if (tree[classCode]?.children[accountCode]) {
          tree[classCode].children[accountCode].children[account.code] = {
            ...account,
            type: level
          };
        }
      }
      return tree;
    }, {});

    res.json({
      success: true,
      accounts: accountTree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plan comptable'
    });
  }
});

// Créer ou mettre à jour un compte
router.post('/', [
  body('code').trim().notEmpty(),
  body('label').trim().notEmpty(),
  body('type').isIn(['class', 'account', 'subaccount']),
  body('category').optional().isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
  body('normalBalance').optional().isIn(['debit', 'credit'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { code, label, type, category, normalBalance } = req.body;

    // Vérifier si le compte existe déjà
    const existingAccount = db.prepare(`
      SELECT * FROM accounts 
      WHERE code = ? AND user_id = ?
    `).get(code, req.user.id);

    if (existingAccount) {
      // Mettre à jour le compte existant
      db.prepare(`
        UPDATE accounts 
        SET label = ?, type = ?, category = ?, normal_balance = ?
        WHERE code = ? AND user_id = ?
      `).run(label, type, category, normalBalance, code, req.user.id);
    } else {
      // Créer un nouveau compte
      db.prepare(`
        INSERT INTO accounts (
          id, code, label, type, category, normal_balance, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), code, label, type, category, normalBalance, req.user.id);
    }

    const account = db.prepare(`
      SELECT * FROM accounts 
      WHERE code = ? AND user_id = ?
    `).get(code, req.user.id);

    res.json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création/mise à jour du compte'
    });
  }
});

export default router;