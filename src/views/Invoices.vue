<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInvoicesStore, type Invoice } from '../stores/invoices'
import InvoiceForm from '../components/InvoiceForm.vue'
import InvoicePDF from '../components/InvoicePDF.vue'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const store = useInvoicesStore()
const showForm = ref(false)
const selectedInvoice = ref<Invoice | null>(null)
const pdfRef = ref<{ generatePDF: () => Promise<void> }>()
const searchQuery = ref('')
const sortBy = ref<keyof Invoice>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const filters = ref({
  type: '' as Invoice['type'] | '',
  status: '' as Invoice['status'] | '',
  startDate: '',
  endDate: ''
})

const stats = computed(() => store.getStats)

const filteredInvoices = computed(() => {
  return store.filteredInvoices({
    type: filters.value.type || undefined,
    status: filters.value.status || undefined,
    startDate: filters.value.startDate,
    endDate: filters.value.endDate,
    search: searchQuery.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  })
})

const handleInvoiceSaved = () => {
  showForm.value = false
}

const viewInvoice = (invoice: Invoice) => {
  selectedInvoice.value = invoice
}

const downloadPDF = async () => {
  if (pdfRef.value) {
    await pdfRef.value.generatePDF()
  }
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const formatStatus = (status: Invoice['status']) => {
  const labels = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée'
  }
  return labels[status]
}

const toggleSort = (key: keyof Invoice) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="font-heading text-2xl font-bold text-gray-900">
        Factures
      </h1>
      
      <button
        v-if="!showForm"
        @click="showForm = true"
        class="btn-primary"
      >
        Nouvelle facture
      </button>
    </div>
    
    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card flex items-center p-4">
        <div class="rounded-full bg-blue-100 p-3 mr-4">
          <DocumentTextIcon class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Total factures</p>
          <p class="text-xl font-semibold">{{ stats.total }}</p>
        </div>
      </div>
      
      <div class="card flex items-center p-4">
        <div class="rounded-full bg-yellow-100 p-3 mr-4">
          <ClockIcon class="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p class="text-sm text-gray-600">En attente</p>
          <p class="text-xl font-semibold">{{ stats.sent }}</p>
        </div>
      </div>
      
      <div class="card flex items-center p-4">
        <div class="rounded-full bg-green-100 p-3 mr-4">
          <ChartBarIcon class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Payées</p>
          <p class="text-xl font-semibold">{{ stats.paid }}</p>
        </div>
      </div>
      
      <div class="card flex items-center p-4">
        <div class="rounded-full bg-purple-100 p-3 mr-4">
          <CurrencyEuroIcon class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Montant total</p>
          <p class="text-xl font-semibold">
            {{ stats.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
          </p>
        </div>
      </div>
    </div>
    
    <template v-if="showForm">
      <div class="card">
        <InvoiceForm @saved="handleInvoiceSaved" />
      </div>
    </template>
    
    <template v-else>
      <!-- Filtres -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher..."
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="filters.type"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Tous</option>
              <option value="sale">Vente</option>
              <option value="purchase">Achat</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="filters.status"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              v-model="filters.startDate"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              v-model="filters.endDate"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
        </div>
      </div>
      
      <!-- Liste des factures -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="toggleSort('number')"
                >
                  <div class="flex items-center">
                    Numéro
                    <span v-if="sortBy === 'number'" class="ml-1">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="toggleSort('date')"
                >
                  <div class="flex items-center">
                    Date
                    <span v-if="sortBy === 'date'" class="ml-1">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="toggleSort('client')"
                >
                  <div class="flex items-center">
                    Client
                    <span v-if="sortBy === 'client'" class="ml-1">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th
                  class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="toggleSort('total')"
                >
                  <div class="flex items-center justify-end">
                    Total
                    <span v-if="sortBy === 'total'" class="ml-1">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th class="px-3 py-3 relative w-8"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50">
                <td class="px-3 py-4 whitespace-nowrap">
                  {{ invoice.number }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  {{ format(new Date(invoice.date), 'dd/MM/yyyy') }}
                </td>
                <td class="px-3 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ invoice.client.name }}</div>
                  <div class="text-sm text-gray-500">{{ invoice.client.email }}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  {{ invoice.type === 'sale' ? 'Vente' : 'Achat' }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    statusColors[invoice.status]
                  ]">
                    {{ formatStatus(invoice.status) }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {{ invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency }) }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewInvoice(invoice)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    
    <!-- Modal de visualisation -->
    <div v-if="selectedInvoice" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 class="text-lg font-medium">
            Facture {{ selectedInvoice.number }}
          </h2>
          <div class="space-x-2">
            <button
              @click="downloadPDF"
              class="px-3 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200"
            >
              Télécharger PDF
            </button>
            <button
              @click="selectedInvoice = null"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
        </div>
        
        <InvoicePDF
          ref="pdfRef"
          :invoice="selectedInvoice"
        />
      </div>
    </div>
  </div>
</template>