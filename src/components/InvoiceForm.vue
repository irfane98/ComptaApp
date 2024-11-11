<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInvoicesStore, type Invoice, type InvoiceItem } from '../stores/invoices'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { format, addDays } from 'date-fns'

const store = useInvoicesStore()
const emit = defineEmits(['saved'])

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoyée' },
  { value: 'paid', label: 'Payée' },
  { value: 'cancelled', label: 'Annulée' }
]

const currencyOptions = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'XAF', label: 'XAF - Franc CFA' }
]

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' }
]

const paymentTermsOptions = [
  { value: '0', label: 'Paiement immédiat' },
  { value: '15', label: '15 jours' },
  { value: '30', label: '30 jours' },
  { value: '45', label: '45 jours' },
  { value: '60', label: '60 jours' }
]

const newInvoice = ref<Omit<Invoice, 'id' | 'number'>>({
  type: 'sale',
  date: format(new Date(), 'yyyy-MM-dd'),
  dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  client: {
    name: '',
    address: '',
    email: '',
    vatNumber: ''
  },
  items: [createEmptyItem()],
  subtotal: 0,
  taxTotal: 0,
  total: 0,
  status: 'draft',
  paymentTerms: '30',
  paymentMethod: 'bank_transfer',
  currency: 'EUR',
  notes: ''
})

function createEmptyItem(): InvoiceItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 20,
    total: 0
  }
}

const addItem = () => {
  newInvoice.value.items.push(createEmptyItem())
  calculateTotals()
}

const removeItem = (index: number) => {
  if (newInvoice.value.items.length > 1) {
    newInvoice.value.items.splice(index, 1)
    calculateTotals()
  }
}

const calculateTotals = () => {
  const totals = store.calculateTotals(newInvoice.value.items)
  newInvoice.value.subtotal = totals.subtotal
  newInvoice.value.taxTotal = totals.taxTotal
  newInvoice.value.total = totals.total
  
  newInvoice.value.items.forEach(item => {
    item.total = item.quantity * item.unitPrice * (1 + item.taxRate / 100)
  })
}

const handleSubmit = () => {
  store.addInvoice(newInvoice.value)
  emit('saved')
}

const isValid = computed(() => {
  return (
    newInvoice.value.client.name &&
    newInvoice.value.client.address &&
    newInvoice.value.client.email &&
    newInvoice.value.items.every(item => 
      item.description && 
      item.quantity > 0 && 
      item.unitPrice > 0
    )
  )
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- En-tête de facture -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Type de facture</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <label class="inline-flex items-center">
              <input
                type="radio"
                v-model="newInvoice.type"
                value="sale"
                class="form-radio text-primary-600"
              >
              <span class="ml-2">Facture de vente</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                v-model="newInvoice.type"
                value="purchase"
                class="form-radio text-primary-600"
              >
              <span class="ml-2">Facture d'achat</span>
            </label>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                v-model="newInvoice.date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Date d'échéance</label>
              <input
                type="date"
                v-model="newInvoice.dueDate"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              v-model="newInvoice.client.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Adresse</label>
            <textarea
              v-model="newInvoice.client.address"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                v-model="newInvoice.client.email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">N° TVA</label>
              <input
                type="text"
                v-model="newInvoice.client.vatNumber"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Options de paiement et statut -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Mode de paiement</label>
        <select
          v-model="newInvoice.paymentMethod"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Conditions de paiement</label>
        <select
          v-model="newInvoice.paymentTerms"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option v-for="option in paymentTermsOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Devise</label>
        <select
          v-model="newInvoice.currency"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Statut</label>
        <select
          v-model="newInvoice.status"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Articles -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Articles</h3>
        <button
          type="button"
          @click="addItem"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter un article
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
              <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
              <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TVA (%)</th>
              <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-3 py-3 relative w-8"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in newInvoice.items" :key="item.id">
              <td class="px-3 py-2">
                <input
                  type="text"
                  v-model="item.description"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  @input="calculateTotals"
                >
              </td>
              <td class="px-3 py-2">
                <input
                  type="number"
                  v-model="item.quantity"
                  min="1"
                  class="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-right"
                  @input="calculateTotals"
                >
              </td>
              <td class="px-3 py-2">
                <input
                  type="number"
                  v-model="item.unitPrice"
                  min="0"
                  step="0.01"
                  class="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-right"
                  @input="calculateTotals"
                >
              </td>
              <td class="px-3 py-2">
                <input
                  type="number"
                  v-model="item.taxRate"
                  min="0"
                  max="100"
                  class="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-right"
                  @input="calculateTotals"
                >
              </td>
              <td class="px-3 py-2 text-right font-medium">
                {{ item.total.toLocaleString('fr-FR', { style: 'currency', currency: newInvoice.currency }) }}
              </td>
              <td class="px-3 py-2">
                <button
                  v-if="newInvoice.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="text-red-600 hover:text-red-900"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-200">
              <td colspan="4" class="px-3 py-3 text-right font-medium">Sous-total :</td>
              <td class="px-3 py-3 text-right font-medium">
                {{ newInvoice.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: newInvoice.currency }) }}
              </td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4" class="px-3 py-3 text-right font-medium">TVA :</td>
              <td class="px-3 py-3 text-right font-medium">
                {{ newInvoice.taxTotal.toLocaleString('fr-FR', { style: 'currency', currency: newInvoice.currency }) }}
              </td>
              <td></td>
            </tr>
            <tr class="border-t-2 border-gray-200">
              <td colspan="4" class="px-3 py-3 text-right font-medium text-lg">Total :</td>
              <td class="px-3 py-3 text-right font-medium text-lg">
                {{ newInvoice.total.toLocaleString('fr-FR', { style: 'currency', currency: newInvoice.currency }) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    
    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Notes</label>
      <textarea
        v-model="newInvoice.notes"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      ></textarea>
    </div>
    
    <!-- Actions -->
    <div class="flex justify-end space-x-3">
      <button
        type="submit"
        class="btn-primary"
        :disabled="!isValid"
      >
        Créer la facture
      </button>
    </div>
  </form>
</template>