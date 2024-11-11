<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeable?: boolean
}>(), {
  size: 'md',
  closeable: true
})

const emit = defineEmits(['close'])

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeable) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
}
</script>

<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeable && $emit('close')"
    >
      <div :class="['bg-white rounded-xl shadow-xl w-full overflow-hidden', sizes[size]]">
        <div v-if="title || closeable" class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 v-if="title" class="text-lg font-medium text-gray-900">
              {{ title }}
            </h3>
            <button
              v-if="closeable"
              class="text-gray-400 hover:text-gray-500"
              @click="$emit('close')"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div class="overflow-y-auto max-h-[calc(100vh-10rem)]">
          <slot />
        </div>
        
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>