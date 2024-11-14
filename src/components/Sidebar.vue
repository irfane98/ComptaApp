<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  HomeIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const navigation = [
  { name: 'Tableau de bord', to: '/', icon: HomeIcon },
  { name: 'Transactions', to: '/transactions', icon: CurrencyDollarIcon },
  { name: 'Plan comptable', to: '/plan-comptable', icon: BookOpenIcon },
  { name: 'Journaux', to: '/journals', icon: DocumentDuplicateIcon },
  { name: 'Factures', to: '/invoices', icon: DocumentTextIcon },
  { name: 'Rapprochement', to: '/bank-reconciliation', icon: BanknotesIcon },
  { name: 'États financiers', to: '/financial-statements', icon: ChartBarIcon },
  { name: 'Profil', to: '/profile', icon: UserCircleIcon }
]

const handleLogout = () => {
  auth.logout()
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-100 p-6">
    <div class="font-heading font-bold text-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-transparent bg-clip-text mb-8">
      ComptaApp
    </div>
    
    <div v-if="auth.user" class="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <img
            :src="auth.user.avatar"
            :alt="auth.user.name"
            class="w-10 h-10 rounded-full ring-2 ring-primary-100"
          >
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">{{ auth.user.name }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ auth.user.role }}</p>
        </div>
      </div>
    </div>
    
    <nav class="space-y-1">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        class="nav-link group"
        :class="{ 'active': $route.path === item.to }"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" 
        />
        {{ item.name }}
      </RouterLink>
      
      <button
        @click="handleLogout"
        class="w-full nav-link group text-red-600 hover:bg-red-50"
      >
        <span class="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-x-1">⇠</span>
        Déconnexion
      </button>
    </nav>
  </aside>
</template>