<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountingPlanStore, type Account } from '../stores/accountingPlan'
import BaseCard from './base/BaseCard.vue'
import {
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const store = useAccountingPlanStore()
const expandedAccounts = ref<Set<string>>(new Set())
const searchQuery = ref('')

const toggleAccount = (code: string) => {
  if (expandedAccounts.value.has(code)) {
    expandedAccounts.value.delete(code)
  } else {
    expandedAccounts.value.add(code)
  }
}

const getIcon = (type: Account['type']) => {
  switch (type) {
    case 'class':
    case 'account':
      return FolderIcon
    case 'subaccount':
      return DocumentIcon
  }
}

const getIndentClass = (level: number) => {
  switch (level) {
    case 0: return ''
    case 1: return 'ml-6'
    default: return 'ml-12'
  }
}

const filteredAccounts = computed(() => {
  if (!searchQuery.value) return store.accounts
  
  const search = searchQuery.value.toLowerCase()
  
  const filterAccount = (account: Account): Account | null => {
    const matchesSearch = 
      account.code.toLowerCase().includes(search) ||
      account.label.toLowerCase().includes(search)
    
    if (matchesSearch) {
      return account
    }
    
    if (account.children) {
      const matchingChildren = account.children
        .map(child => filterAccount(child))
        .filter((child): child is Account => child !== null)
      
      if (matchingChildren.length > 0) {
        return {
          ...account,
          children: matchingChildren
        }
      }
    }
    
    return null
  }
  
  return store.accounts
    .map(account => filterAccount(account))
    .filter((account): account is Account => account !== null)
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Plan Comptable OHADA
    </h1>
    
    <BaseCard>
      <div class="mb-6">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            v-model="searchQuery"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Rechercher un compte..."
          >
        </div>
      </div>
      
      <div class="space-y-1">
        <template v-for="account in filteredAccounts" :key="account.code">
          <div>
            <!-- Compte principal -->
            <div
              class="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              @click="account.children?.length && toggleAccount(account.code)"
            >
              <ChevronRightIcon
                v-if="account.children?.length"
                class="w-5 h-5 text-gray-400 transition-transform"
                :class="{ 'rotate-90': expandedAccounts.has(account.code) }"
              />
              <component
                :is="getIcon(account.type)"
                class="w-5 h-5"
                :class="{
                  'text-primary-500': account.type === 'class',
                  'text-success-500': account.type === 'account',
                  'text-gray-500': account.type === 'subaccount',
                  'ml-6': !account.children?.length,
                  'ml-1': account.children?.length
                }"
              />
              <span
                class="ml-2"
                :class="{ 'font-medium': account.type === 'class' }"
              >
                {{ account.code }} - {{ account.label }}
              </span>
              <span v-if="account.description" class="ml-2 text-sm text-gray-500">
                ({{ account.description }})
              </span>
            </div>
            
            <!-- Sous-comptes -->
            <template v-if="expandedAccounts.has(account.code) && account.children">
              <div
                v-for="child in account.children"
                :key="child.code"
                class="ml-6"
              >
                <div
                  class="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  @click="child.children?.length && toggleAccount(child.code)"
                >
                  <ChevronRightIcon
                    v-if="child.children?.length"
                    class="w-5 h-5 text-gray-400 transition-transform"
                    :class="{ 'rotate-90': expandedAccounts.has(child.code) }"
                  />
                  <component
                    :is="getIcon(child.type)"
                    class="w-5 h-5"
                    :class="{
                      'text-primary-500': child.type === 'class',
                      'text-success-500': child.type === 'account',
                      'text-gray-500': child.type === 'subaccount',
                      'ml-6': !child.children?.length,
                      'ml-1': child.children?.length
                    }"
                  />
                  <span class="ml-2">
                    {{ child.code }} - {{ child.label }}
                  </span>
                  <span v-if="child.normalBalance" class="ml-2 text-sm text-gray-500">
                    ({{ child.normalBalance === 'debit' ? 'Débiteur' : 'Créditeur' }})
                  </span>
                </div>
                
                <!-- Sous-sous-comptes -->
                <template v-if="expandedAccounts.has(child.code) && child.children">
                  <div
                    v-for="subChild in child.children"
                    :key="subChild.code"
                    class="flex items-center p-2 rounded-lg hover:bg-gray-50 ml-6"
                  >
                    <component
                      :is="getIcon(subChild.type)"
                      class="w-5 h-5 ml-6 text-gray-500"
                    />
                    <span class="ml-2">
                      {{ subChild.code }} - {{ subChild.label }}
                    </span>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </template>
      </div>
    </BaseCard>
  </div>
</template>