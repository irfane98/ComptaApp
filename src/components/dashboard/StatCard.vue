<script setup lang="ts">
const props = defineProps<{
  title: string
  value: number
  type?: 'default' | 'success' | 'danger'
  icon?: any
}>()

const getColorClass = (type?: string) => {
  switch (type) {
    case 'success':
      return 'text-success-500'
    case 'danger':
      return 'text-red-500'
    default:
      return props.value >= 0 ? 'text-success-500' : 'text-red-500'
  }
}

const getIconColorClass = (type?: string) => {
  switch (type) {
    case 'success':
      return 'bg-success-100 text-success-600'
    case 'danger':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-primary-100 text-primary-600'
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 group">
    <div class="flex items-center">
      <div 
        v-if="icon" 
        class="rounded-full p-3 mr-4 transition-all duration-300 group-hover:scale-110" 
        :class="getIconColorClass(type)"
      >
        <component :is="icon" class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-xl font-bold" :class="getColorClass(type)">
          {{ value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
        </p>
      </div>
    </div>
  </div>
</template>