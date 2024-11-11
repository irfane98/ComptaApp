import localforage from 'localforage'
import { ref } from 'vue'

// Configuration de localforage pour la persistance des données
localforage.config({
  name: 'compta-app',
  storeName: 'accounting_data',
  version: 1.0,
  description: 'Application de comptabilité OHADA'
})

// Données initiales pour les devises
const currencies = [
  { code: 'XAF', label: 'Franc CFA', symbol: 'FCFA' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dollar US', symbol: '$' }
]

// Données initiales pour les modes de paiement
const paymentMethods = [
  { code: 'bank_transfer', label: 'Virement bancaire' },
  { code: 'cash', label: 'Espèces' },
  { code: 'check', label: 'Chèque' },
  { code: 'mobile_money', label: 'Mobile Money' }
]

// Données initiales pour les conditions de paiement
const paymentTerms = [
  { days: 0, label: 'Paiement immédiat' },
  { days: 15, label: '15 jours' },
  { days: 30, label: '30 jours' },
  { days: 45, label: '45 jours' },
  { days: 60, label: '60 jours' }
]

export const db = {
  async init() {
    try {
      // Initialiser les données de base si elles n'existent pas
      const existingCurrencies = await localforage.getItem('currencies')
      if (!existingCurrencies) {
        await localforage.setItem('currencies', currencies)
      }

      const existingPaymentMethods = await localforage.getItem('paymentMethods')
      if (!existingPaymentMethods) {
        await localforage.setItem('paymentMethods', paymentMethods)
      }

      const existingPaymentTerms = await localforage.getItem('paymentTerms')
      if (!existingPaymentTerms) {
        await localforage.setItem('paymentTerms', paymentTerms)
      }

      console.log('Base de données initialisée avec succès')
      return true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error)
      return false
    }
  },

  async saveData(key: string, data: any) {
    try {
      await localforage.setItem(key, data)
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde des données ${key}:`, error)
    }
  },

  async getData(key: string) {
    try {
      return await localforage.getItem(key)
    } catch (error) {
      console.error(`Erreur lors de la récupération des données ${key}:`, error)
      return null
    }
  },

  async removeData(key: string) {
    try {
      await localforage.removeItem(key)
    } catch (error) {
      console.error(`Erreur lors de la suppression des données ${key}:`, error)
    }
  }
}