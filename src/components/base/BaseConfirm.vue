<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps<{
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal
    :show="show"
    :title="title"
    size="sm"
    @close="$emit('cancel')"
  >
    <div class="p-6">
      <p class="text-sm text-gray-600">
        {{ message }}
      </p>
    </div>
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <BaseButton
          variant="secondary"
          @click="$emit('cancel')"
        >
          {{ cancelText || 'Annuler' }}
        </BaseButton>
        
        <BaseButton
          :variant="type === 'danger' ? 'danger' : 'primary'"
          @click="$emit('confirm')"
        >
          {{ confirmText || 'Confirmer' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>