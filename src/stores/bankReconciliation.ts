import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JournalEntry } from './journals'

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  reference?: string
  type: 'credit' | 'debit'
  status: 'pending' | 'matched' | 'unmatched'
  matchedEntryId?: string
}

interface ReconciliationMatch {
  bankTransactionId: string
  journalEntryId: string
  confidence: number
}

export const useBankReconciliationStore = defineStore('bankReconciliation', () => {
  const transactions = ref<BankTransaction[]>([])
  const matches = ref<ReconciliationMatch[]>([])
  const selectedPeriod = ref<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  
  const importTransactions = (newTransactions: Omit<BankTransaction, 'id' | 'status'>[]) => {
    const formattedTransactions = newTransactions.map(transaction => ({
      ...transaction,
      id: crypto.randomUUID(),
      status: 'pending' as const
    }))
    transactions.value = [...transactions.value, ...formattedTransactions]
  }
  
  const findMatches = (journalEntries: JournalEntry[]) => {
    const newMatches: ReconciliationMatch[] = []
    
    transactions.value.forEach(transaction => {
      const potentialMatches = journalEntries.filter(entry => {
        // Vérifier si les montants correspondent
        const entryAmount = entry.entries.reduce((sum, e) => 
          sum + (transaction.type === 'credit' ? e.credit : e.debit), 0)
        
        return (
          Math.abs(entryAmount - Math.abs(transaction.amount)) < 0.01 &&
          new Date(entry.date).getTime() === new Date(transaction.date).getTime()
        )
      })
      
      if (potentialMatches.length === 1) {
        const match: ReconciliationMatch = {
          bankTransactionId: transaction.id,
          journalEntryId: potentialMatches[0].id,
          confidence: calculateConfidence(transaction, potentialMatches[0])
        }
        newMatches.push(match)
        
        // Mettre à jour le statut de la transaction
        const transactionIndex = transactions.value.findIndex(t => t.id === transaction.id)
        if (transactionIndex !== -1) {
          transactions.value[transactionIndex].status = 'matched'
          transactions.value[transactionIndex].matchedEntryId = potentialMatches[0].id
        }
      } else {
        // Marquer comme non rapproché si aucune correspondance n'est trouvée
        const transactionIndex = transactions.value.findIndex(t => t.id === transaction.id)
        if (transactionIndex !== -1) {
          transactions.value[transactionIndex].status = 'unmatched'
        }
      }
    })
    
    matches.value = newMatches
  }
  
  const calculateConfidence = (transaction: BankTransaction, entry: JournalEntry): number => {
    let confidence = 0
    
    // Correspondance exacte des montants
    const entryAmount = entry.entries.reduce((sum, e) => 
      sum + (transaction.type === 'credit' ? e.credit : e.debit), 0)
    if (Math.abs(entryAmount - Math.abs(transaction.amount)) < 0.01) {
      confidence += 50
    }
    
    // Correspondance des dates
    if (new Date(entry.date).getTime() === new Date(transaction.date).getTime()) {
      confidence += 30
    }
    
    // Correspondance des descriptions (recherche de mots-clés communs)
    const transactionWords = transaction.description.toLowerCase().split(' ')
    const entryWords = entry.description.toLowerCase().split(' ')
    const commonWords = transactionWords.filter(word => entryWords.includes(word))
    confidence += (commonWords.length / Math.max(transactionWords.length, entryWords.length)) * 20
    
    return Math.min(confidence, 100)
  }
  
  const getUnmatchedTransactions = computed(() => 
    transactions.value.filter(t => t.status === 'unmatched')
  )
  
  const getMatchedTransactions = computed(() => 
    transactions.value.filter(t => t.status === 'matched')
  )
  
  const getPendingTransactions = computed(() => 
    transactions.value.filter(t => t.status === 'pending')
  )
  
  const getTotalUnmatched = computed(() => 
    getUnmatchedTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  )
  
  const getMatchByTransactionId = (transactionId: string) => 
    matches.value.find(m => m.bankTransactionId === transactionId)
  
  const confirmMatch = (transactionId: string, entryId: string) => {
    const transactionIndex = transactions.value.findIndex(t => t.id === transactionId)
    if (transactionIndex !== -1) {
      transactions.value[transactionIndex].status = 'matched'
      transactions.value[transactionIndex].matchedEntryId = entryId
    }
    
    const existingMatchIndex = matches.value.findIndex(m => m.bankTransactionId === transactionId)
    if (existingMatchIndex !== -1) {
      matches.value[existingMatchIndex].journalEntryId = entryId
    } else {
      matches.value.push({
        bankTransactionId: transactionId,
        journalEntryId: entryId,
        confidence: 100 // Match confirmé manuellement
      })
    }
  }
  
  const unmatch = (transactionId: string) => {
    const transactionIndex = transactions.value.findIndex(t => t.id === transactionId)
    if (transactionIndex !== -1) {
      transactions.value[transactionIndex].status = 'unmatched'
      transactions.value[transactionIndex].matchedEntryId = undefined
    }
    
    matches.value = matches.value.filter(m => m.bankTransactionId !== transactionId)
  }
  
  const setPeriod = (start: string, end: string) => {
    selectedPeriod.value = { start, end }
  }
  
  return {
    transactions,
    matches,
    selectedPeriod,
    importTransactions,
    findMatches,
    getUnmatchedTransactions,
    getMatchedTransactions,
    getPendingTransactions,
    getTotalUnmatched,
    getMatchByTransactionId,
    confirmMatch,
    unmatch,
    setPeriod
  }
})