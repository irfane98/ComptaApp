<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalsStore, type JournalEntry } from '../stores/journals'
import { useAccountingPlanStore } from '../stores/accountingPlan'
import BaseCard from './base/BaseCard.vue'
import BaseInput from './base/BaseInput.vue'
import BaseSelect from './base/BaseSelect.vue'
import BaseButton from './base/BaseButton.vue'
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const journalsStore = useJournalsStore()
const accountingStore = useAccountingPlanStore()

const journals = [
  { value: 'purchases', label: 'Journal des achats' },
  { value: 'sales', label: 'Journal des ventes' },
  { value: 'bank', label: 'Journal de banque' },
  { value: 'cash', label: 'Journal de caisse' }
]

const newEntry = ref<Omit<JournalEntry, 'id'>>({
  date: new Date().toISOString().split('T')[0],
  reference: '',
  description: '',
  journal: 'purchases',
  entries: [
    { accountCode: '', label: '', debit: 0, credit: 0 },
    { accountCode: '', label: '', debit: 0, credit: 0 }
  ]
})

const addLine = () => {
  newEntry.value.entries.push({ accountCode: '', label: '', debit: 0, credit: 0 })
}

const removeLine = (index: number) => {
  if (newEntry.value.entries.length > 2) {
    newEntry.value.entries.splice(index, 1)
  }
}

const totalDebit = computed(() => 
  newEntry.value.entries.reduce((sum, entry) => sum + entry.debit, 0)
)

const totalCredit = computed(() => 
  newEntry.value.entries.reduce((sum, entry) => sum + entry.credit, 0)
)

const isBalanced = computed(() => 
  Math.abs(totalDebit.value - totalCredit.value) < 0.01
)

const difference = computed(() => 
  totalDebit.value - totalCredit.value
)

const resetForm = () => {
  newEntry.value = {
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    journal: 'purchases',
    entries: [
      { accountCode: '', label: '', debit: 0, credit: 0 },
      { accountCode: '', label: '', debit: 0, credit: 0 }
    ]
  }
}

const handleSubmit = () => {
  if (isBalanced.value) {
    journalsStore.addEntry(newEntry.value)
    resetForm()
  }
}

const getAccountSuggestions = (code: string) => {
  if (!code) return []
  return accountingStore.searchAccounts(code)
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

const updateDebit = (index: number, value: number) => {
  newEntry.value.entries[index].debit = value
  newEntry.value.entries[index].credit = 0
}

const updateCredit = (index: number, value: number) => {
  newEntry.value.entries[index].credit = value
  newEntry.value.entries[index].debit = 0
}
</script>

<template>
  <div class="space-y-6">
    <BaseCard>
      <template #title>
        Nouvelle écriture comptable
      </template>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseSelect
            v-model="newEntry.journal"
            label="Journal"
            :options="journals"
            required
          />
          
          <BaseInput
            v-model="newEntry.date"
            type="date"
            label="Date"
            required
          />
          
          <BaseInput
            v-model="newEntry.reference"
            label="Référence"
            placeholder="REF-001"
          />
        </div>
        
        <BaseInput
          v-model="newEntry.description"
          label="Description"
          placeholder="Description de l'écriture comptable"
          required
        />
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-gray-900">Lignes d'écriture</h3>
            <BaseButton
              type="button"
              variant="secondary"
              @click="addLine"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Ajouter une ligne
            </BaseButton>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 text-left text-sm font-medium text-gray-500">Compte</th>
                  <th class="py-3 text-left text-sm font-medium text-gray-500">Libellé</th>
                  <th class="py-3 text-right text-sm font-medium text-gray-500">Débit</th>
                  <th class="py-3 text-right text-sm font-medium text-gray-500">Crédit</th>
                  <th class="py-3 w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(entry, index) in newEntry.entries"
                  :key="index"
                  class="group hover:bg-gray-50 transition-colors"
                >
                  <td class="py-2">
                    <div class="relative">
                      <input
                        type="text"
                        v-model="entry.accountCode"
                        class="w-32 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Code"
                        required
                      >
                      <div
                        v-if="entry.accountCode"
                        class="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block"
                      >
                        <div
                          v-for="suggestion in getAccountSuggestions(entry.accountCode)"
                          :key="suggestion.code"
                          class="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          @click="entry.accountCode = suggestion.code"
                        >
                          {{ suggestion.code }} - {{ suggestion.label }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-2">
                    <input
                      type="text"
                      v-model="entry.label"
                      class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Libellé"
                      required
                    >
                  </td>
                  <td class="py-2">
                    <input
                      type="number"
                      v-model="entry.debit"
                      step="0.01"
                      class="w-32 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-right"
                      @input="updateDebit(index, parseFloat($event.target.value) || 0)"
                    >
                  </td>
                  <td class="py-2">
                    <input
                      type="number"
                      v-model="entry.credit"
                      step="0.01"
                      class="w-32 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-right"
                      @input="updateCredit(index, parseFloat($event.target.value) || 0)"
                    >
                  </td>
                  <td class="py-2">
                    <button
                      v-if="newEntry.entries.length > 2"
                      type="button"
                      class="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="removeLine(index)"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="border-t-2 border-gray-200">
                <tr>
                  <td colspan="2" class="py-3 text-right font-medium">Totaux :</td>
                  <td class="py-3 text-right font-medium">
                    {{ formatAmount(totalDebit) }}
                  </td>
                  <td class="py-3 text-right font-medium">
                    {{ formatAmount(totalCredit) }}
                  </td>
                  <td></td>
                </tr>
                <tr v-if="!isBalanced">
                  <td colspan="5" class="py-2">
                    <div class="flex items-center justify-end text-sm text-red-600">
                      <ExclamationCircleIcon class="w-5 h-5 mr-1" />
                      Différence : {{ formatAmount(difference) }}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <BaseButton
            type="button"
            variant="secondary"
            @click="resetForm"
          >
            <ArrowPathIcon class="w-4 h-4 mr-1" />
            Réinitialiser
          </BaseButton>
          
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="!isBalanced"
          >
            Enregistrer l'écriture
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>