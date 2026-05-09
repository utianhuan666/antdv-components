<docs lang="zh-CN">
ProFormDependency debug 示例，对标 React `pro-form-dependency.debug.tsx`。
</docs>

<docs lang="en-US">
ProFormDependency debug example, mirroring React `pro-form-dependency.debug.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormText } from '@antdv/components'
import { reactive } from 'vue'

const model = reactive({ name: 'Ant Design', company: 'Ant Group' })

function handleValuesChange(_: Record<string, any>, values: Record<string, any>) {
  Object.assign(model, values)
}
</script>

<template>
  <ProForm :model="model" @values-change="handleValuesChange">
    <ProFormText name="name" label="Name" />
    <ProFormText name="company" label="Company" />
    <a-alert type="info" :message="`Current dependency values: ${model.name} / ${model.company}`" />
  </ProForm>
</template>
