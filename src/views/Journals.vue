<script setup lang="ts">
import { ref } from 'vue'
import { useJournalsStore, type JournalEntry } from '../stores/journals'
import JournalEntryForm from '../components/JournalEntry.vue'

const store = useJournalsStore()
const selectedJournal = ref<JournalEntry['journal']>('purchases')

const journals = {
  purchases: 'Journal des achats',
  sales: 'Journal des ventes',
  bank: 'Journal de banque',
  cash: 'Journal de caisse'
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Journaux Comptables
    </h1>
    
    <JournalEntryForm />
    
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-heading text-lg font-medium">Consultation des écritures</h2>
        
        <select
          v-model="selectedJournal"
          class="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option v-for="(label, value) in journals" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Référence</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Compte</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
              <th class="py-3 text-right text-sm font-medium text-gray-500">Débit</th>
              <th class="py-3 text-right text-sm font-medium text-gray-500">Crédit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-for="entry in store.entriesByJournal(selectedJournal)" :key="entry.id">
              <tr
                v-for="(line, index) in entry.entries"
                :key="index"
                :class="{ 'bg-gray-50': index === 0 }"
                class="hover:bg-gray-50 transition-colors"
              >
                <td v-if="index === 0" :rowspan="entry.entries.length" class="py-3 align-top">
                  {{ new Date(entry.date).toLocaleDateString('fr-FR') }}
                </td>
                <td v-if="index === 0" :rowspan="entry.entries.length" class="py-3 align-top">
                  {{ entry.reference }}
                </td>
                <td v-if="index === 0" :rowspan="entry.entries.length" class="py-3 align-top">
                  {{ entry.description }}
                </td>
                <td class="py-3">{{ line.accountCode }}</td>
                <td class="py-3">{{ line.label }}</td>
                <td class="py-3 text-right">
                  {{ formatAmount(line.debit) }}
                </td>
                <td class="py-3 text-right">
                  {{ formatAmount(line.credit) }}
                </td>
              </tr>
            </template>
            <tr v-if="!store.entriesByJournal(selectedJournal).length" class="hover:bg-gray-50">
              <td colspan="7" class="py-4 text-center text-gray-500">
                Aucune écriture dans ce journal
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>