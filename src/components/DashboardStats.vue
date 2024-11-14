<script setup lang="ts">
import { computed } from 'vue'
import { useAccountingStore } from '../stores/accounting'

const store = useAccountingStore()

const balance = computed(() => store.balance)
const totalIncome = computed(() => store.totalIncome)
const totalExpenses = computed(() => store.totalExpenses)

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500 mb-2">Solde total</h3>
      <p class="text-2xl font-bold" :class="balance >= 0 ? 'text-success-500' : 'text-red-500'">
        {{ formatCurrency(balance) }}
      </p>
    </div>
    
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500 mb-2">Revenus</h3>
      <p class="text-2xl font-bold text-success-500">
        {{ formatCurrency(totalIncome) }}
      </p>
    </div>
    
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500 mb-2">Dépenses</h3>
      <p class="text-2xl font-bold text-red-500">
        {{ formatCurrency(totalExpenses) }}
      </p>
    </div>
  </div>
</template>