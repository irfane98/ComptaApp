import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomUUID } from 'crypto';
import db from '../db/init.js';

const router = express.Router();

// Récupérer les écritures d'un journal
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const entries = db.prepare(`
      SELECT * FROM journal_entries 
      WHERE user_id = ? AND journal_type = ?
      ORDER BY date DESC
    `).all(req.user.id, type);

    // Récupérer les lignes d'écritures associées
    const entriesWithLines = entries.map(entry => ({
      ...entry,
      entries: db.prepare(`
        SELECT * FROM journal_lines 
        WHERE entry_id = ?
        ORDER BY id ASC
      `).all(entry.id)
    }));

    res.json({
      success: true,
      entries: entriesWithLines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des écritures'
    });
  }
});

// Créer une nouvelle écriture
router.post('/', [
  body('date').isISO8601(),
  body('reference').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('journal').isIn(['purchases', 'sales', 'bank', 'cash']),
  body('entries').isArray().notEmpty(),
  body('entries.*.accountCode').trim().notEmpty(),
  body('entries.*.label').trim().notEmpty(),
  body('entries.*.debit').isNumeric(),
  body('entries.*.credit').isNumeric()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { date, reference, description, journal, entries } = req.body;

  // Vérifier l'équilibre débit/crédit
  const totalDebit = entries.reduce((sum, entry) => sum + parseFloat(entry.debit), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + parseFloat(entry.credit), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      success: false,
      message: 'L\'écriture n\'est pas équilibrée'
    });
  }

  try {
    const entryId = randomUUID();

    // Insérer l'écriture principale
    db.prepare(`
      INSERT INTO journal_entries (
        id, date, reference, description, journal_type, user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(entryId, date, reference, description, journal, req.user.id);

    // Insérer les lignes d'écriture
    const insertLine = db.prepare(`
      INSERT INTO journal_lines (
        id, entry_id, account_code, label, debit, credit
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    entries.forEach(line => {
      insertLine.run(
        randomUUID(),
        entryId,
        line.accountCode,
        line.label,
        line.debit,
        line.credit
      );
    });

    // Récupérer l'écriture complète
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(entryId);
    entry.entries = db.prepare('SELECT * FROM journal_lines WHERE entry_id = ?').all(entryId);

    // Émettre un événement WebSocket
    req.app.get('io').to(`user-${req.user.id}`).emit('journalEntryCreated', entry);

    res.status(201).json({
      success: true,
      entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'écriture'
    });
  }
});

export default router;