<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountingStore } from '../stores/accounting'
import { useInvoicesStore } from '../stores/invoices'
import StatCard from '../components/dashboard/StatCard.vue'
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import BaseCard from '../components/base/BaseCard.vue'

const accountingStore = useAccountingStore()
const invoicesStore = useInvoicesStore()

const balance = computed(() => accountingStore.balance)
const totalIncome = computed(() => accountingStore.totalIncome)
const totalExpenses = computed(() => accountingStore.totalExpenses)
const invoiceStats = computed(() => invoicesStore.getStats)

const formatAmount = (amount: number) => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (e) {
    console.error(e)
    return '0 €'
  }
}

const monthlyData = ref([
  { month: 'Jan', income: 12500, expenses: 8200 },
  { month: 'Fév', income: 15000, expenses: 9100 },
  { month: 'Mar', income: 13800, expenses: 8900 },
  { month: 'Avr', income: 14200, expenses: 9300 },
  { month: 'Mai', income: 16500, expenses: 10200 },
  { month: 'Juin', income: 15800, expenses: 9800 }
])
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Tableau de bord
    </h1>
    
    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Solde total"
        :value="balance"
        :icon="CurrencyEuroIcon"
      />
      
      <StatCard
        title="Revenus"
        :value="totalIncome"
        type="success"
        :icon="ArrowTrendingUpIcon"
      />
      
      <StatCard
        title="Dépenses"
        :value="totalExpenses"
        type="danger"
        :icon="ArrowTrendingDownIcon"
      />
      
      <StatCard
        title="Factures en attente"
        :value="invoiceStats.totalAmount"
        :icon="DocumentTextIcon"
      />
    </div>
    
    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Évolution mensuelle -->
      <BaseCard>
        <template #title>
          <div class="flex items-center">
            <ChartBarIcon class="w-5 h-5 mr-2 text-gray-500" />
            Évolution mensuelle
          </div>
        </template>
        
        <div class="h-80">
          <!-- Graphique à barres -->
          <div class="flex h-full items-end space-x-4">
            <template v-for="data in monthlyData" :key="data.month">
              <div class="flex-1 space-y-2">
                <div class="flex flex-col space-y-1">
                  <div
                    class="bg-success-500 rounded-t"
                    :style="`height: ${(data.income / 20000) * 100}%`"
                  ></div>
                  <div
                    class="bg-red-500 rounded-t"
                    :style="`height: ${(data.expenses / 20000) * 100}%`"
                  ></div>
                </div>
                <div class="text-xs text-center text-gray-600">{{ data.month }}</div>
              </div>
            </template>
          </div>
          
          <!-- Légende -->
          <div class="flex justify-center mt-4 space-x-4">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-success-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Revenus</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span class="text-sm text-gray-600">Dépenses</span>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Répartition des factures -->
      <BaseCard>
        <template #title>
          <div class="flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-2 text-gray-500" />
            État des factures
          </div>
        </template>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm text-gray-600">En attente</span>
              <span class="font-medium">{{ invoiceStats.sent }}</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-success-50 rounded-lg">
              <span class="text-sm text-gray-600">Payées</span>
              <span class="font-medium text-success-600">{{ invoiceStats.paid }}</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span class="text-sm text-gray-600">En retard</span>
              <span class="font-medium text-red-600">{{ invoiceStats.draft }}</span>
            </div>
          </div>
          
          <!-- Graphique circulaire simplifié -->
          <div class="relative">
            <svg class="w-full" viewBox="0 0 100 100">
              <!-- Cercle de base -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E7EB"
                stroke-width="20"
              />
              
              <!-- Segments -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                stroke-width="20"
                stroke-dasharray="251.2"
                :stroke-dashoffset="251.2 * (1 - invoiceStats.paid / invoiceStats.total)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-500"
              />
            </svg>
            
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-bold text-success-600">
                  {{ Math.round((invoiceStats.paid / invoiceStats.total) * 100) }}%
                </div>
                <div class="text-sm text-gray-500">payées</div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>