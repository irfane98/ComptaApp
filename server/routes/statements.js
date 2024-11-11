import express from 'express';
import { query } from 'express-validator';
import db from '../db/init.js';

const router = express.Router();

// Calculer le solde d'un compte pour une période donnée
const getAccountBalance = (accountCode, userId, startDate, endDate) => {
  const lines = db.prepare(`
    SELECT jl.* 
    FROM journal_lines jl
    JOIN journal_entries je ON je.id = jl.entry_id
    WHERE je.user_id = ?
    AND je.date BETWEEN ? AND ?
    AND jl.account_code LIKE ?
  `).all(userId, startDate, endDate, `${accountCode}%`);

  return lines.reduce((balance, line) => 
    balance + (line.debit - line.credit), 0);
};

// Générer le bilan
router.get('/balance-sheet', [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Récupérer tous les comptes
    const accounts = db.prepare(`
      SELECT * FROM accounts 
      WHERE user_id = ? 
      AND (
        code LIKE '1%' OR  -- Capitaux
        code LIKE '2%' OR  -- Immobilisations
        code LIKE '3%' OR  -- Stocks
        code LIKE '4%' OR  -- Tiers
        code LIKE '5%'     -- Trésorerie
      )
      ORDER BY code
    `).all(req.user.id);

    // Calculer les soldes
    const balanceSheet = accounts.reduce((result, account) => {
      const balance = getAccountBalance(account.code, req.user.id, startDate, endDate);
      
      if (account.code.startsWith('1')) {
        result.equity.push({ ...account, balance });
        result.totalEquity += balance;
      } else if (account.code.startsWith('2') || account.code.startsWith('3')) {
        result.assets.push({ ...account, balance });
        result.totalAssets += balance;
      } else {
        result.liabilities.push({ ...account, balance });
        result.totalLiabilities += balance;
      }
      
      return result;
    }, {
      assets: [],
      liabilities: [],
      equity: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0
    });

    res.json({
      success: true,
      balanceSheet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du bilan'
    });
  }
});

// Générer le compte de résultat
router.get('/income-statement', [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Récupérer les comptes de charges et produits
    const accounts = db.prepare(`
      SELECT * FROM accounts 
      WHERE user_id = ? 
      AND (code LIKE '6%' OR code LIKE '7%')
      ORDER BY code
    `).all(req.user.id);

    // Calculer les soldes
    const incomeStatement = accounts.reduce((result, account) => {
      const balance = getAccountBalance(account.code, req.user.id, startDate, endDate);
      
      if (account.code.startsWith('6')) {
        result.expenses.push({ ...account, balance });
        result.totalExpenses += balance;
      } else {
        result.revenues.push({ ...account, balance });
        result.totalRevenues += balance;
      }
      
      return result;
    }, {
      revenues: [],
      expenses: [],
      totalRevenues: 0,
      totalExpenses: 0
    });

    // Calculer le résultat net
    incomeStatement.netIncome = incomeStatement.totalRevenues - incomeStatement.totalExpenses;

    res.json({
      success: true,
      incomeStatement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du compte de résultat'
    });
  }
});

export default router;