<script setup lang="ts">
import { ref } from 'vue'
import { useFinancialStatementsStore } from '../stores/financialStatements'
import BaseCard from '../components/base/BaseCard.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon
} from '@heroicons/vue/24/outline'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const store = useFinancialStatementsStore()
const activeTab = ref<'balance' | 'income'>('balance')

const period = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})

const updatePeriod = () => {
  store.setPeriod(period.value.start, period.value.end)
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

const exportPDF = () => {
  const doc = new jsPDF()
  
  // En-tête
  doc.setFontSize(20)
  doc.text(activeTab.value === 'balance' ? 'Bilan' : 'Compte de résultat', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Période du ${period.value.start} au ${period.value.end}`, 20, 30)
  
  if (activeTab.value === 'balance') {
    // Bilan
    const balanceData = [
      // Actif
      ['ACTIF', '', ''],
      ...store.balanceSheet.assets.map(account => [
        account.code,
        account.label,
        formatAmount(account.balance)
      ]),
      ['Total Actif', '', formatAmount(store.balanceSheet.totalAssets)],
      // Passif
      ['PASSIF', '', ''],
      ...store.balanceSheet.liabilities.map(account => [
        account.code,
        account.label,
        formatAmount(account.balance)
      ]),
      ['Total Passif', '', formatAmount(store.balanceSheet.totalLiabilities)],
      // Capitaux propres
      ['CAPITAUX PROPRES', '', ''],
      ...store.balanceSheet.equity.map(account => [
        account.code,
        account.label,
        formatAmount(account.balance)
      ]),
      ['Total Capitaux propres', '', formatAmount(store.balanceSheet.totalEquity)]
    ]
    
    doc.autoTable({
      startY: 40,
      head: [['Code', 'Libellé', 'Montant']],
      body: balanceData,
      theme: 'grid'
    })
  } else {
    // Compte de résultat
    const incomeData = [
      // Produits
      ['PRODUITS', '', ''],
      ...store.incomeStatement.revenues.map(account => [
        account.code,
        account.label,
        formatAmount(account.balance)
      ]),
      ['Total Produits', '', formatAmount(store.incomeStatement.totalRevenues)],
      // Charges
      ['CHARGES', '', ''],
      ...store.incomeStatement.expenses.map(account => [
        account.code,
        account.label,
        formatAmount(account.balance)
      ]),
      ['Total Charges', '', formatAmount(store.incomeStatement.totalExpenses)],
      // Résultat
      ['RÉSULTAT NET', '', formatAmount(store.incomeStatement.netIncome)]
    ]
    
    doc.autoTable({
      startY: 40,
      head: [['Code', 'Libellé', 'Montant']],
      body: incomeData,
      theme: 'grid'
    })
  }
  
  doc.save(`etats-financiers-${period.value.start}-${period.value.end}.pdf`)
}

const exportExcel = () => {
  let csv = 'Code;Libellé;Montant\n'
  
  if (activeTab.value === 'balance') {
    // Bilan
    csv += 'ACTIF;;;\n'
    store.balanceSheet.assets.forEach(account => {
      csv += `${account.code};${account.label};${account.balance}\n`
    })
    csv += `Total Actif;;${store.balanceSheet.totalAssets}\n\n`
    
    csv += 'PASSIF;;;\n'
    store.balanceSheet.liabilities.forEach(account => {
      csv += `${account.code};${account.label};${account.balance}\n`
    })
    csv += `Total Passif;;${store.balanceSheet.totalLiabilities}\n\n`
    
    csv += 'CAPITAUX PROPRES;;;\n'
    store.balanceSheet.equity.forEach(account => {
      csv += `${account.code};${account.label};${account.balance}\n`
    })
    csv += `Total Capitaux propres;;${store.balanceSheet.totalEquity}\n`
  } else {
    // Compte de résultat
    csv += 'PRODUITS;;;\n'
    store.incomeStatement.revenues.forEach(account => {
      csv += `${account.code};${account.label};${account.balance}\n`
    })
    csv += `Total Produits;;${store.incomeStatement.totalRevenues}\n\n`
    
    csv += 'CHARGES;;;\n'
    store.incomeStatement.expenses.forEach(account => {
      csv += `${account.code};${account.label};${account.balance}\n`
    })
    csv += `Total Charges;;${store.incomeStatement.totalExpenses}\n\n`
    
    csv += `RÉSULTAT NET;;${store.incomeStatement.netIncome}\n`
  }
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `etats-financiers-${period.value.start}-${period.value.end}.csv`
  link.click()
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      États Financiers
    </h1>
    
    <!-- Période et exports -->
    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium mb-4">Période</h3>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput
              v-model="period.start"
              type="date"
              label="Date début"
              @change="updatePeriod"
            />
            
            <BaseInput
              v-model="period.end"
              type="date"
              label="Date fin"
              @change="updatePeriod"
            />
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-4">Exports</h3>
          <div class="flex space-x-4">
            <BaseButton
              variant="secondary"
              @click="exportPDF"
            >
              <DocumentTextIcon class="w-5 h-5 mr-2" />
              Exporter en PDF
            </BaseButton>
            
            <BaseButton
              variant="secondary"
              @click="exportExcel"
            >
              <TableCellsIcon class="w-5 h-5 mr-2" />
              Exporter en Excel
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>
    
    <!-- Onglets -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          class="py-4 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'balance'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          @click="activeTab = 'balance'"
        >
          <ScaleIcon class="w-5 h-5 inline-block mr-2" />
          Bilan
        </button>
        
        <button
          class="py-4 px-1 border-b-2 font-medium text-sm"
          :class="activeTab === 'income'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          @click="activeTab = 'income'"
        >
          <DocumentArrowDownIcon class="w-5 h-5 inline-block mr-2" />
          Compte de résultat
        </button>
      </nav>
    </div>
    
    <!-- Bilan -->
    <div v-if="activeTab === 'balance'" class="space-y-6">
      <!-- Actif -->
      <BaseCard>
        <template #title>
          <div class="flex items-center text-success-600">
            <ArrowTrendingUpIcon class="w-5 h-5 mr-2" />
            Actif
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="account in store.balanceSheet.assets"
                :key="account.code"
                class="hover:bg-gray-50"
              >
                <td class="py-3 text-sm">{{ account.code }}</td>
                <td class="py-3 text-sm">{{ account.label }}</td>
                <td class="py-3 text-sm text-right">{{ formatAmount(account.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 font-medium">
                <td colspan="2" class="py-3 text-right">Total Actif</td>
                <td class="py-3 text-right">{{ formatAmount(store.balanceSheet.totalAssets) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BaseCard>
      
      <!-- Passif -->
      <BaseCard>
        <template #title>
          <div class="flex items-center text-red-600">
            <ArrowTrendingDownIcon class="w-5 h-5 mr-2" />
            Passif
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="account in store.balanceSheet.liabilities"
                :key="account.code"
                class="hover:bg-gray-50"
              >
                <td class="py-3 text-sm">{{ account.code }}</td>
                <td class="py-3 text-sm">{{ account.label }}</td>
                <td class="py-3 text-sm text-right">{{ formatAmount(account.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 font-medium">
                <td colspan="2" class="py-3 text-right">Total Passif</td>
                <td class="py-3 text-right">{{ formatAmount(store.balanceSheet.totalLiabilities) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BaseCard>
      
      <!-- Capitaux propres -->
      <BaseCard>
        <template #title>
          <div class="flex items-center text-primary-600">
            <ScaleIcon class="w-5 h-5 mr-2" />
            Capitaux propres
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="account in store.balanceSheet.equity"
                :key="account.code"
                class="hover:bg-gray-50"
              >
                <td class="py-3 text-sm">{{ account.code }}</td>
                <td class="py-3 text-sm">{{ account.label }}</td>
                <td class="py-3 text-sm text-right">{{ formatAmount(account.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 font-medium">
                <td colspan="2" class="py-3 text-right">Total Capitaux propres</td>
                <td class="py-3 text-right">{{ formatAmount(store.balanceSheet.totalEquity) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BaseCard>
    </div>
    
    <!-- Compte de résultat -->
    <div v-else class="space-y-6">
      <!-- Produits -->
      <BaseCard>
        <template #title>
          <div class="flex items-center text-success-600">
            <ArrowTrendingUpIcon class="w-5 h-5 mr-2" />
            Produits
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="account in store.incomeStatement.revenues"
                :key="account.code"
                class="hover:bg-gray-50"
              >
                <td class="py-3 text-sm">{{ account.code }}</td>
                <td class="py-3 text-sm">{{ account.label }}</td>
                <td class="py-3 text-sm text-right">{{ formatAmount(account.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 font-medium">
                <td colspan="2" class="py-3 text-right">Total Produits</td>
                <td class="py-3 text-right">{{ formatAmount(store.incomeStatement.totalRevenues) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BaseCard>
      
      <!-- Charges -->
      <BaseCard>
        <template #title>
          <div class="flex items-center text-red-600">
            <ArrowTrendingDownIcon class="w-5 h-5 mr-2" />
            Charges
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-500">Code</th>
                <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="account in store.incomeStatement.expenses"
                :key="account.code"
                class="hover:bg-gray-50"
              >
                <td class="py-3 text-sm">{{ account.code }}</td>
                <td class="py-3 text-sm">{{ account.label }}</td>
                <td class="py-3 text-sm text-right">{{ formatAmount(account.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200 font-medium">
                <td colspan="2" class="py-3 text-right">Total Charges</td>
                <td class="py-3 text-right">{{ formatAmount(store.incomeStatement.totalExpenses) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BaseCard>
      
      <!-- Résultat -->
      <BaseCard>
        <template #title>
          <div class="flex items-center" :class="store.incomeStatement.netIncome >= 0 ? 'text-success-600' : 'text-red-600'">
            <ScaleIcon class="w-5 h-5 mr-2" />
            Résultat net
          </div>
        </template>
        
        <div class="text-center">
          <p class="text-3xl font-bold" :class="store.incomeStatement.netIncome >= 0 ? 'text-success-600' : 'text-red-600'">
            {{ formatAmount(store.incomeStatement.netIncome) }}
          </p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>