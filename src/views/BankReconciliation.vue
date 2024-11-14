<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBankReconciliationStore } from '../stores/bankReconciliation'
import { useJournalsStore } from '../stores/journals'
import BaseCard from '../components/base/BaseCard.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import {
  ArrowPathIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const bankStore = useBankReconciliationStore()
const journalStore = useJournalsStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

const period = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    selectedFile.value = input.files[0]
  }
}

const importTransactions = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const rows = content.split('\n')
        
        // Ignorer l'en-tête
        const transactions = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [date, description, amount, type] = row.split(',')
            return {
              date,
              description: description.trim(),
              amount: parseFloat(amount),
              type: parseFloat(amount) > 0 ? 'credit' as const : 'debit' as const
            }
          })
        
        bankStore.importTransactions(transactions)
        bankStore.setPeriod(period.value.start, period.value.end)
        bankStore.findMatches(journalStore.entries)
        
        selectedFile.value = null
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      } catch (e) {
        error.value = 'Format de fichier invalide'
      }
    }
    reader.readAsText(selectedFile.value)
  } catch (e) {
    error.value = 'Erreur lors de l\'importation'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => ({
  total: bankStore.transactions.length,
  matched: bankStore.getMatchedTransactions.length,
  unmatched: bankStore.getUnmatchedTransactions.length,
  pending: bankStore.getPendingTransactions.length
}))

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'matched':
      return 'text-success-500'
    case 'unmatched':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'matched':
      return CheckCircleIcon
    case 'unmatched':
      return XCircleIcon
    default:
      return ExclamationTriangleIcon
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Rapprochement Bancaire
    </h1>
    
    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <BaseCard>
        <div class="flex items-center">
          <div class="rounded-full bg-gray-100 p-3 mr-4">
            <DocumentArrowUpIcon class="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total transactions</p>
            <p class="text-xl font-semibold">{{ stats.total }}</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="flex items-center">
          <div class="rounded-full bg-success-100 p-3 mr-4">
            <CheckCircleIcon class="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Rapprochées</p>
            <p class="text-xl font-semibold text-success-600">{{ stats.matched }}</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="flex items-center">
          <div class="rounded-full bg-red-100 p-3 mr-4">
            <XCircleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Non rapprochées</p>
            <p class="text-xl font-semibold text-red-600">{{ stats.unmatched }}</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="flex items-center">
          <div class="rounded-full bg-yellow-100 p-3 mr-4">
            <ExclamationTriangleIcon class="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">En attente</p>
            <p class="text-xl font-semibold text-yellow-600">{{ stats.pending }}</p>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- Import et période -->
    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium mb-4">Import du relevé bancaire</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <input
                ref="fileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileSelect"
              >
              <BaseButton
                variant="secondary"
                @click="fileInput?.click()"
              >
                <DocumentArrowUpIcon class="w-5 h-5 mr-2" />
                Sélectionner un fichier
              </BaseButton>
              <span v-if="selectedFile" class="text-sm text-gray-600">
                {{ selectedFile.name }}
              </span>
            </div>
            
            <div v-if="error" class="text-sm text-red-600">
              {{ error }}
            </div>
            
            <BaseButton
              variant="primary"
              :disabled="!selectedFile || loading"
              @click="importTransactions"
            >
              <ArrowPathIcon
                v-if="loading"
                class="w-5 h-5 mr-2 animate-spin"
              />
              <span v-else>Importer</span>
            </BaseButton>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-4">Période</h3>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput
              v-model="period.start"
              type="date"
              label="Date début"
            />
            
            <BaseInput
              v-model="period.end"
              type="date"
              label="Date fin"
            />
          </div>
        </div>
      </div>
    </BaseCard>
    
    <!-- Liste des transactions -->
    <BaseCard>
      <h3 class="text-lg font-medium mb-4">Transactions bancaires</h3>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th class="py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th class="py-3 text-right text-sm font-medium text-gray-500">Montant</th>
              <th class="py-3 text-center text-sm font-medium text-gray-500">Statut</th>
              <th class="py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="transaction in bankStore.transactions"
              :key="transaction.id"
              class="hover:bg-gray-50"
            >
              <td class="py-3 text-sm">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="py-3 text-sm">
                {{ transaction.description }}
              </td>
              <td
                class="py-3 text-sm text-right"
                :class="transaction.amount >= 0 ? 'text-success-600' : 'text-red-600'"
              >
                {{ formatAmount(transaction.amount) }}
              </td>
              <td class="py-3 text-sm">
                <div class="flex items-center justify-center">
                  <component
                    :is="getStatusIcon(transaction.status)"
                    class="w-5 h-5"
                    :class="getStatusColor(transaction.status)"
                  />
                </div>
              </td>
              <td class="py-3 text-sm text-right">
                <div class="flex items-center justify-end space-x-2">
                  <BaseButton
                    v-if="transaction.status === 'matched'"
                    variant="danger"
                    @click="bankStore.unmatch(transaction.id)"
                  >
                    Délier
                  </BaseButton>
                  
                  <BaseButton
                    v-else
                    variant="primary"
                    @click="bankStore.confirmMatch(transaction.id, '')"
                  >
                    Rapprocher
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>