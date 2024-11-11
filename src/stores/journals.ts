import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface JournalEntry {
  id: string
  date: string
  reference: string
  description: string
  entries: {
    accountCode: string
    label: string
    debit: number
    credit: number
  }[]
  journal: 'purchases' | 'sales' | 'bank' | 'cash'
}

export const useJournalsStore = defineStore('journals', () => {
  const entries = ref<JournalEntry[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  
  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    try {
      const newEntry = {
        ...entry,
        id: crypto.randomUUID()
      }
      entries.value.push(newEntry)
      error.value = null
    } catch (e) {
      error.value = "Erreur lors de l'ajout de l'écriture"
      console.error(e)
    }
  }
  
  const fetchEntries = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simule un chargement asynchrone
      await new Promise(resolve => setTimeout(resolve, 500))
      error.value = null
    } catch (e) {
      error.value = "Erreur lors du chargement des écritures"
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }
  
  const entriesByJournal = computed(() => {
    return (journal: JournalEntry['journal']) =>
      entries.value.filter(entry => entry.journal === journal)
  })
  
  const isBalanced = (entries: JournalEntry['entries']) => {
    try {
      const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0)
      const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0)
      return Math.abs(totalDebit - totalCredit) < 0.01
    } catch (e) {
      error.value = "Erreur lors de la vérification de l'équilibre"
      console.error(e)
      return false
    }
  }
  
  return {
    entries,
    error,
    isLoading,
    addEntry,
    fetchEntries,
    entriesByJournal,
    isBalanced
  }
})