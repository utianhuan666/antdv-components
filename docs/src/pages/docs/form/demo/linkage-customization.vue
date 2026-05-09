<docs lang="zh-CN">
自定义联动示例，对标 React `linkage-customization.tsx`。
</docs>

<docs lang="en-US">
Customized linkage example, mirroring React `linkage-customization.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormSelect, ProFormText } from '@antdv/components'
import { computed, reactive } from 'vue'

const model = reactive({ type: 'company', name: '' })
const nameLabel = computed(() => (model.type === 'company' ? 'Company Name' : 'Personal Name'))

function handleValuesChange(_: Record<string, any>, values: Record<string, any>) {
  Object.assign(model, values)
}
</script>

<template>
  <ProForm :model="model" @values-change="handleValuesChange">
    <ProFormSelect name="type" label="Type" :value-enum="{ company: 'Company', personal: 'Personal' }" />
    <ProFormText name="name" :label="nameLabel" />
  </ProForm>
</template>
