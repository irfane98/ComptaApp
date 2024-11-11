import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../database/init'

export const useBackupStore = defineStore('backup', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const createBackup = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = {
        settings: await db.getData('settings'),
        accounts: await db.getData('accounts'),
        journals: await db.getData('journals'),
        invoices: await db.getData('invoices'),
        transactions: await db.getData('transactions'),
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup-${new Date().toISOString()}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Erreur lors de la création de la sauvegarde'
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  const restoreBackup = async (file: File) => {
    loading.value = true
    error.value = null
    
    try {
      const content = await file.text()
      const data = JSON.parse(content)
      
      // Restaurer les données
      await db.saveData('settings', data.settings)
      await db.saveData('accounts', data.accounts)
      await db.saveData('journals', data.journals)
      await db.saveData('invoices', data.invoices)
      await db.saveData('transactions', data.transactions)
      
      // Recharger l'application
      window.location.reload()
    } catch (e) {
      error.value = 'Erreur lors de la restauration de la sauvegarde'
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    createBackup,
    restoreBackup
  }
})