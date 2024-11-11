<script setup lang="ts">
defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info'
  dismissible?: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="rounded-lg p-4 mb-4"
    :class="{
      'bg-success-50 text-success-700': type === 'success',
      'bg-red-50 text-red-700': type === 'error',
      'bg-yellow-50 text-yellow-700': type === 'warning',
      'bg-blue-50 text-blue-700': type === 'info'
    }"
  >
    <div class="flex">
      <div class="flex-1">
        <slot></slot>
      </div>
      <button
        v-if="dismissible"
        class="ml-4"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>
  </div>
</template>