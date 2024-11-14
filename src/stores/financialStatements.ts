import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAccountingPlanStore } from './accountingPlan'
import { useJournalsStore } from './journals'

interface FinancialAccount {
  code: string
  label: string
  balance: number
  children?: FinancialAccount[]
}

interface BalanceSheet {
  assets: FinancialAccount[]
  liabilities: FinancialAccount[]
  equity: FinancialAccount[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

interface IncomeStatement {
  revenues: FinancialAccount[]
  expenses: FinancialAccount[]
  totalRevenues: number
  totalExpenses: number
  netIncome: number
}

export const useFinancialStatementsStore = defineStore('financialStatements', () => {
  const accountingPlanStore = useAccountingPlanStore()
  const journalsStore = useJournalsStore()
  
  const selectedPeriod = ref({
    start: '',
    end: ''
  })
  
  const balanceSheet = computed((): BalanceSheet => {
    const assets: FinancialAccount[] = []
    const liabilities: FinancialAccount[] = []
    const equity: FinancialAccount[] = []
    
    // Calculer les soldes pour chaque compte
    accountingPlanStore.accounts.forEach(account => {
      const balance = calculateAccountBalance(account.code)
      
      if (account.code.startsWith('1')) {
        equity.push({ code: account.code, label: account.label, balance })
      } else if (account.code.startsWith('2') || account.code.startsWith('3') || account.code.startsWith('4')) {
        assets.push({ code: account.code, label: account.label, balance })
      } else if (account.code.startsWith('5')) {
        liabilities.push({ code: account.code, label: account.label, balance })
      }
    })
    
    const totalAssets = assets.reduce((sum, account) => sum + account.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, account) => sum + account.balance, 0)
    const totalEquity = equity.reduce((sum, account) => sum + account.balance, 0)
    
    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity
    }
  })
  
  const incomeStatement = computed((): IncomeStatement => {
    const revenues: FinancialAccount[] = []
    const expenses: FinancialAccount[] = []
    
    accountingPlanStore.accounts.forEach(account => {
      const balance = calculateAccountBalance(account.code)
      
      if (account.code.startsWith('7')) {
        revenues.push({ code: account.code, label: account.label, balance })
      } else if (account.code.startsWith('6')) {
        expenses.push({ code: account.code, label: account.label, balance })
      }
    })
    
    const totalRevenues = revenues.reduce((sum, account) => sum + account.balance, 0)
    const totalExpenses = expenses.reduce((sum, account) => sum + account.balance, 0)
    
    return {
      revenues,
      expenses,
      totalRevenues,
      totalExpenses,
      netIncome: totalRevenues - totalExpenses
    }
  })
  
  const calculateAccountBalance = (accountCode: string): number => {
    return journalsStore.entries
      .filter(entry => {
        if (selectedPeriod.value.start && entry.date < selectedPeriod.value.start) return false
        if (selectedPeriod.value.end && entry.date > selectedPeriod.value.end) return false
        return true
      })
      .reduce((balance, entry) => {
        const accountEntries = entry.entries.filter(e => e.accountCode.startsWith(accountCode))
        return balance + accountEntries.reduce((sum, e) => sum + (e.debit - e.credit), 0)
      }, 0)
  }
  
  const setPeriod = (start: string, end: string) => {
    selectedPeriod.value = { start, end }
  }
  
  return {
    balanceSheet,
    incomeStatement,
    selectedPeriod,
    setPeriod
  }
})