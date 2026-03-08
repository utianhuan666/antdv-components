<script setup lang="ts">
import type { ButtonProps } from 'antdv-next'
import type { ButtonSlots } from 'antdv-next/dist/button/Button'
import { Button } from 'antdv-next'

defineOptions({
  name: 'MyButton',
})

const props = defineProps<ButtonProps>()
const emit = defineEmits<{
  click: [MouseEvent]
}>()
defineSlots<ButtonSlots>()
function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <Button v-bind="props" @click="handleClick">
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :key="name"
        :name="name as keyof ButtonSlots"
        v-bind="slotProps"
      />
    </template>
  </Button>
</template>
