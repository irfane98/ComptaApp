<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  format?: (value: any) => string
}

defineProps<{
  columns: Column[]
  items: any[]
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th
            v-for="column in columns"
            :key="column.key"
            class="py-3 text-sm font-medium text-gray-500"
            :class="{
              'text-left': column.align !== 'right' && column.align !== 'center',
              'text-right': column.align === 'right',
              'text-center': column.align === 'center'
            }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr
          v-for="(item, index) in items"
          :key="index"
          class="hover:bg-gray-50 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="py-3"
            :class="{
              'text-left': column.align !== 'right' && column.align !== 'center',
              'text-right': column.align === 'right',
              'text-center': column.align === 'center'
            }"
            :rowspan="item.rowspan && column.key === 'date' ? item.rowspan : undefined"
          >
            {{ column.format ? column.format(item[column.key]) : item[column.key] }}
          </td>
        </tr>
      </tbody>
      <slot name="footer"></slot>
    </table>
  </div>
</template>