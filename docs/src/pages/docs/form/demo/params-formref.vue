<docs lang="zh-CN">
params 与 formRef debug 示例，对标 React `params-formref.tsx`。
</docs>

<docs lang="en-US">
params and formRef debug example, mirroring React `params-formref.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormText } from '@antdv/components'
import { reactive, shallowRef } from 'vue'

const params = reactive({ id: '100' })
const formRef = shallowRef<{ getFieldsValue: () => Record<string, any> }>()

function handleReadValues() {
  console.warn('params', params, 'values', formRef.value?.getFieldsValue())
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%">
    <a-button @click="params.id = String(Number(params.id) + 1)">
      Change Params
    </a-button>
    <a-button @click="handleReadValues">
      Read Form Values
    </a-button>
    <ProForm ref="formRef" :params="params" :request="async () => ({ name: `Ant Design ${params.id}` })">
      <ProFormText name="name" label="Name" />
    </ProForm>
  </a-space>
</template>
