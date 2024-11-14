<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/Sidebar.vue'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isAuthenticated" class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <main class="flex-1 p-8">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>