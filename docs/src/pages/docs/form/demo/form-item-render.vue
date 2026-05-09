<docs lang="zh-CN">
FormItemRender / ProFormItemRender 示例，对标 React `form-item-render.tsx`。
</docs>

<docs lang="en-US">
FormItemRender / ProFormItemRender example, mirroring React `form-item-render.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormItem, ProFormText } from '@antdv/components'
import { reactive } from 'vue'

const model = reactive({ custom: '' })

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm :model="model" @finish="handleFinish">
    <ProFormText name="name" label="Name" />
    <ProFormItem name="custom" label="Custom Render">
      <a-input v-model:value="model.custom" placeholder="Inline custom field" />
    </ProFormItem>
  </ProForm>
</template>
