<docs lang="zh-CN">
表单联动，对标 React `dependency.tsx`。当前 Vue 版本使用 `values-change` 显式维护联动标题。
</docs>

<docs lang="en-US">
Form dependency demo. The Vue version uses `values-change` to keep dependent labels explicit.
</docs>

<script setup lang="ts">
import { ProForm, ProFormSelect, ProFormText } from '@antdv/components'
import { computed, reactive } from 'vue'

const model = reactive({
  name: 'Ant Design Co., Ltd.',
  name2: 'Ant Design Group',
  useMode: 'chapter',
})
const dependencyLabel = computed(() => `Effective method agreed in the contract with "${model.name || ''}" and "${model.name2 || ''}"`)

function handleValuesChange(_: Record<string, any>, values: Record<string, any>) {
  Object.assign(model, values)
}

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm :model="model" @values-change="handleValuesChange" @finish="handleFinish">
    <ProFormText width="md" name="name" label="Contract Customer Name" placeholder="Please enter a name" />
    <ProFormText width="md" name="name2" label="Contract Customer Name" placeholder="Please enter a name" />
    <ProFormSelect
      width="md"
      name="useMode"
      :label="dependencyLabel"
      :value-enum="{ chapter: 'Effective after stamping' }"
    />
  </ProForm>
</template>
