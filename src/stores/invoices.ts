import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
  reference?: string
  unit?: string
}

export interface Invoice {
  id: string
  type: 'sale' | 'purchase'
  number: string
  date: string
  dueDate: string
  client: {
    name: string
    address: string
    email: string
    vatNumber?: string
    phone?: string
    siret?: string
  }
  items: InvoiceItem[]
  subtotal: number
  taxTotal: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  notes?: string
  paymentTerms?: string
  paymentMethod?: string
  currency: string
  language: string
}

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const nextInvoiceNumber = ref(1)
  const defaultCurrency = ref('EUR')
  const defaultLanguage = ref('fr')
  
  const generateInvoiceNumber = (type: Invoice['type']) => {
    const prefix = type === 'sale' ? 'FA' : 'FB'
    const number = nextInvoiceNumber.value.toString().padStart(5, '0')
    nextInvoiceNumber.value++
    return `${prefix}${format(new Date(), 'yyyyMM')}${number}`
  }
  
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'number'>) => {
    const newInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: generateInvoiceNumber(invoice.type),
      currency: invoice.currency || defaultCurrency.value,
      language: invoice.language || defaultLanguage.value
    }
    invoices.value.push(newInvoice)
  }
  
  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const index = invoices.value.findIndex(inv => inv.id === id)
    if (index !== -1) {
      invoices.value[index] = { ...invoices.value[index], ...updates }
    }
  }
  
  const deleteInvoice = (id: string) => {
    invoices.value = invoices.value.filter(inv => inv.id !== id)
  }
  
  const getInvoiceById = computed(() => {
    return (id: string) => invoices.value.find(inv => inv.id === id)
  })
  
  const filteredInvoices = computed(() => {
    return (filters: {
      type?: Invoice['type']
      status?: Invoice['status']
      startDate?: string
      endDate?: string
      search?: string
      sortBy?: keyof Invoice
      sortOrder?: 'asc' | 'desc'
    }) => {
      let result = [...invoices.value]
      
      if (filters.type) {
        result = result.filter(invoice => invoice.type === filters.type)
      }
      
      if (filters.status) {
        result = result.filter(invoice => invoice.status === filters.status)
      }
      
      if (filters.startDate) {
        result = result.filter(invoice => invoice.date >= filters.startDate)
      }
      
      if (filters.endDate) {
        result = result.filter(invoice => invoice.date <= filters.endDate)
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(invoice => 
          invoice.number.toLowerCase().includes(searchLower) ||
          invoice.client.name.toLowerCase().includes(searchLower) ||
          invoice.client.email.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters.sortBy) {
        result.sort((a: any, b: any) => {
          let valueA = a[filters.sortBy!]
          let valueB = b[filters.sortBy!]
          
          if (filters.sortBy === 'client') {
            valueA = a.client.name
            valueB = b.client.name
          }
          
          if (typeof valueA === 'string') {
            return filters.sortOrder === 'desc'
              ? valueB.localeCompare(valueA)
              : valueA.localeCompare(valueB)
          }
          
          return filters.sortOrder === 'desc'
            ? valueB - valueA
            : valueA - valueB
        })
      }
      
      return result
    }
  })
  
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxTotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice
      return sum + (itemTotal * item.taxRate / 100)
    }, 0)
    return {
      subtotal,
      taxTotal,
      total: subtotal + taxTotal
    }
  }
  
  const getStats = computed(() => {
    const total = invoices.value.length
    const draft = invoices.value.filter(i => i.status === 'draft').length
    const sent = invoices.value.filter(i => i.status === 'sent').length
    const paid = invoices.value.filter(i => i.status === 'paid').length
    const totalAmount = invoices.value.reduce((sum, i) => sum + i.total, 0)
    
    return {
      total,
      draft,
      sent,
      paid,
      totalAmount
    }
  })
  
  return {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    filteredInvoices,
    calculateTotals,
    getStats,
    defaultCurrency,
    defaultLanguage
  }
})