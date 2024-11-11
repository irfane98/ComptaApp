<script setup lang="ts">
import { ref } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'

const store = useAccountingStore()

const newTransaction = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  amount: 0,
  type: 'income' as 'income' | 'expense'
})

const transactionTypes = [
  { value: 'income', label: 'Revenu' },
  { value: 'expense', label: 'Dépense' }
]

const addTransaction = () => {
  store.addTransaction(newTransaction.value)
  newTransaction.value = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'income'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Transactions
    </h1>
    
    <div class="card">
      <h2 class="font-heading text-lg font-medium mb-4">Nouvelle transaction</h2>
      
      <form @submit.prevent="addTransaction" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BaseInput
          v-model="newTransaction.date"
          type="date"
          label="Date"
          required
        />
        
        <BaseInput
          v-model="newTransaction.description"
          label="Description"
          placeholder="Description de la transaction"
          required
        />
        
        <BaseInput
          v-model="newTransaction.amount"
          type="number"
          label="Montant"
          step="0.01"
          required
        />
        
        <BaseSelect
          v-model="newTransaction.type"
          label="Type"
          :options="transactionTypes"
          required
        />
        
        <div class="lg:col-span-4">
          <BaseButton type="submit" variant="primary">
            Ajouter la transaction
          </BaseButton>
        </div>
      </form>
    </div>
    
    <div class="card">
      <h2 class="font-heading text-lg font-medium mb-4">Historique des transactions</h2>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="transaction in store.transactions" :key="transaction.id">
              <td class="py-4 text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="py-4 text-sm text-gray-900">
                {{ transaction.description }}
              </td>
              <td class="py-4 text-sm text-right" :class="transaction.type === 'income' ? 'text-success-500' : 'text-red-500'">
                {{ formatAmount(transaction.amount) }}
              </td>
              <td class="py-4 text-sm text-gray-900">
                {{ transaction.type === 'income' ? 'Revenu' : 'Dépense' }}
              </td>
            </tr>
            <tr v-if="store.transactions.length === 0">
              <td colspan="4" class="py-4 text-sm text-gray-500 text-center">
                Aucune transaction enregistrée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>