<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 animate-fade-in">
    <h2 v-if="title" class="text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
      {{ title }}
    </h2>
    <slot></slot>
  </div>
</template>