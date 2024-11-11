<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    :class="{
      'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm hover:shadow-md disabled:from-gray-400 disabled:to-gray-300': variant === 'primary',
      'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100': variant === 'secondary',
      'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:shadow-md': variant === 'danger'
    }"
  >
    <slot></slot>
  </button>
</template>