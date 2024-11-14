import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
}

export const useAccountingStore = defineStore('accounting', () => {
  const transactions = ref<Transaction[]>([])
  const error = ref<string | null>(null)
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    }
    transactions.value.push(newTransaction)
  }
  
  const totalIncome = computed(() => {
    try {
      return transactions.value
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    } catch (e) {
      error.value = "Erreur lors du calcul des revenus"
      console.error(e)
      return 0
    }
  })
  
  const totalExpenses = computed(() => {
    try {
      return transactions.value
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    } catch (e) {
      error.value = "Erreur lors du calcul des dépenses"
      console.error(e)
      return 0
    }
  })
  
  // Le solde est maintenant calculé comme la différence entre revenus et dépenses
  const balance = computed(() => {
    try {
      return totalIncome.value - totalExpenses.value
    } catch (e) {
      error.value = "Erreur lors du calcul du solde"
      console.error(e)
      return 0
    }
  })
  
  return {
    transactions,
    balance,
    error,
    addTransaction,
    totalIncome,
    totalExpenses,
  }
})