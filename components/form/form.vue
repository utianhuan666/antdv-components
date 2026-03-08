<script setup lang="ts">
import type { FormEmits, FormInstance, FormProps, FormSlots } from 'antdv-next'
import { Form } from 'antdv-next'
import { shallowRef } from 'vue'

defineOptions({
  name: 'MyForm',
})

defineProps<FormProps>()
defineEmits<FormEmits>()
defineSlots<FormSlots>()
const formRef = shallowRef<FormInstance>()
defineExpose({
  formRef,
})
</script>

<template>
  <Form ref="formRef">
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :key="name"
        :name="name as keyof FormSlots"
        v-bind="slotProps"
      />
    </template>
  </Form>
</template>
