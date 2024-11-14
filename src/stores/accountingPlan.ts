import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Account {
  code: string
  label: string
  type: 'class' | 'account' | 'subaccount'
  description?: string
  children?: Account[]
  isActive?: boolean
  normalBalance?: 'debit' | 'credit'
  category?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
}

export const useAccountingPlanStore = defineStore('accountingPlan', () => {
  const accounts = ref<Account[]>([
    {
      code: '1',
      label: 'Comptes de ressources durables',
      type: 'class',
      description: 'Capitaux propres et ressources assimilées',
      category: 'equity',
      children: [
        {
          code: '10',
          label: 'Capital',
          type: 'account',
          normalBalance: 'credit',
          children: [
            { code: '101', label: 'Capital social', type: 'subaccount' },
            { code: '102', label: 'Capital souscrit - non appelé', type: 'subaccount' },
            { code: '109', label: 'Actionnaires, capital souscrit - non appelé', type: 'subaccount' }
          ]
        },
        {
          code: '11',
          label: 'Réserves',
          type: 'account',
          normalBalance: 'credit',
          children: [
            { code: '111', label: 'Réserve légale', type: 'subaccount' },
            { code: '112', label: 'Réserves statutaires', type: 'subaccount' },
            { code: '113', label: 'Réserves facultatives', type: 'subaccount' }
          ]
        },
        {
          code: '12',
          label: 'Report à nouveau',
          type: 'account',
          children: [
            { code: '121', label: 'Report à nouveau créditeur', type: 'subaccount' },
            { code: '129', label: 'Report à nouveau débiteur', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '2',
      label: 'Comptes d\'actif immobilisé',
      type: 'class',
      description: 'Immobilisations incorporelles, corporelles et financières',
      category: 'asset',
      children: [
        {
          code: '21',
          label: 'Immobilisations incorporelles',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '211', label: 'Frais de développement', type: 'subaccount' },
            { code: '212', label: 'Brevets, licences et logiciels', type: 'subaccount' },
            { code: '213', label: 'Fonds commercial', type: 'subaccount' }
          ]
        },
        {
          code: '22',
          label: 'Terrains',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '221', label: 'Terrains agricoles et forestiers', type: 'subaccount' },
            { code: '222', label: 'Terrains nus', type: 'subaccount' },
            { code: '223', label: 'Terrains bâtis', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '3',
      label: 'Comptes de stocks',
      type: 'class',
      description: 'Stocks de marchandises, matières et produits',
      category: 'asset',
      children: [
        {
          code: '31',
          label: 'Marchandises',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '311', label: 'Marchandises A', type: 'subaccount' },
            { code: '312', label: 'Marchandises B', type: 'subaccount' }
          ]
        },
        {
          code: '32',
          label: 'Matières premières',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '321', label: 'Matières premières A', type: 'subaccount' },
            { code: '322', label: 'Matières premières B', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '4',
      label: 'Comptes de tiers',
      type: 'class',
      description: 'Créances et dettes de l\'entreprise',
      children: [
        {
          code: '40',
          label: 'Fournisseurs',
          type: 'account',
          normalBalance: 'credit',
          children: [
            { code: '401', label: 'Fournisseurs, dettes en compte', type: 'subaccount' },
            { code: '402', label: 'Fournisseurs, effets à payer', type: 'subaccount' }
          ]
        },
        {
          code: '41',
          label: 'Clients',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '411', label: 'Clients, ventes en compte', type: 'subaccount' },
            { code: '412', label: 'Clients, effets à recevoir', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '5',
      label: 'Comptes de trésorerie',
      type: 'class',
      description: 'Disponibilités et valeurs assimilées',
      category: 'asset',
      children: [
        {
          code: '51',
          label: 'Banques',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '511', label: 'Banque A', type: 'subaccount' },
            { code: '512', label: 'Banque B', type: 'subaccount' }
          ]
        },
        {
          code: '52',
          label: 'Caisse',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '521', label: 'Caisse principale', type: 'subaccount' },
            { code: '522', label: 'Caisse annexe', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '6',
      label: 'Comptes de charges',
      type: 'class',
      description: 'Charges d\'exploitation et financières',
      category: 'expense',
      children: [
        {
          code: '60',
          label: 'Achats',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '601', label: 'Achats de marchandises', type: 'subaccount' },
            { code: '602', label: 'Achats de matières premières', type: 'subaccount' }
          ]
        },
        {
          code: '61',
          label: 'Services extérieurs',
          type: 'account',
          normalBalance: 'debit',
          children: [
            { code: '611', label: 'Sous-traitance générale', type: 'subaccount' },
            { code: '612', label: 'Locations', type: 'subaccount' }
          ]
        }
      ]
    },
    {
      code: '7',
      label: 'Comptes de produits',
      type: 'class',
      description: 'Produits d\'exploitation et financiers',
      category: 'revenue',
      children: [
        {
          code: '70',
          label: 'Ventes',
          type: 'account',
          normalBalance: 'credit',
          children: [
            { code: '701', label: 'Ventes de marchandises', type: 'subaccount' },
            { code: '702', label: 'Ventes de produits finis', type: 'subaccount' }
          ]
        },
        {
          code: '71',
          label: 'Production stockée',
          type: 'account',
          normalBalance: 'credit',
          children: [
            { code: '711', label: 'Variation des stocks de produits finis', type: 'subaccount' },
            { code: '712', label: 'Variation des stocks de produits en cours', type: 'subaccount' }
          ]
        }
      ]
    }
  ])

  const getAccountByCode = computed(() => {
    return (code: string): Account | null => {
      const findAccount = (accounts: Account[]): Account | null => {
        for (const account of accounts) {
          if (account.code === code) return account
          if (account.children) {
            const found = findAccount(account.children)
            if (found) return found
          }
        }
        return null
      }
      return findAccount(accounts.value)
    }
  })

  const searchAccounts = (query: string): Account[] => {
    const results: Account[] = []
    const search = query.toLowerCase()

    const searchInAccount = (account: Account) => {
      const matches = 
        account.code.toLowerCase().includes(search) ||
        account.label.toLowerCase().includes(search)

      if (matches) {
        results.push(account)
      }

      if (account.children) {
        account.children.forEach(searchInAccount)
      }
    }

    accounts.value.forEach(searchInAccount)
    return results
  }

  const getAccountPath = (code: string): Account[] => {
    const path: Account[] = []
    
    const findPath = (accounts: Account[]): boolean => {
      for (const account of accounts) {
        if (account.code === code) {
          path.push(account)
          return true
        }
        if (account.children && findPath(account.children)) {
          path.unshift(account)
          return true
        }
      }
      return false
    }

    findPath(accounts.value)
    return path
  }

  return {
    accounts,
    getAccountByCode,
    searchAccounts,
    getAccountPath
  }
})