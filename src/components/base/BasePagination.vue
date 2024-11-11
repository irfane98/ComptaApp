<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits(['update:currentPage'])

const pages = computed(() => {
  const range = []
  for (let i = 1; i <= props.totalPages; i++) {
    range.push(i)
  }
  return range
})
</script>

<template>
  <div class="flex justify-center space-x-2">
    <button
      class="px-3 py-1 rounded-lg"
      :class="currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'"
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      Précédent
    </button>
    
    <button
      v-for="page in pages"
      :key="page"
      class="px-3 py-1 rounded-lg"
      :class="page === currentPage ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
      @click="$emit('update:currentPage', page)"
    >
      {{ page }}
    </button>
    
    <button
      class="px-3 py-1 rounded-lg"
      :class="currentPage === totalPages ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'"
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      Suivant
    </button>
  </div>
</template>