<docs lang="zh-CN">
通过 `readonly` 让整个 ProForm 进入只读模式，所有字段会以 ProField read 模式展示。
</docs>

<docs lang="en-US">
Use `readonly` to put the whole form into read-only mode.
</docs>

<script setup lang="ts">
import { ProForm, ProFormDatePicker, ProFormSelect, ProFormText } from '@antdv/components'
import { ref } from 'vue'

const readonly = ref(true)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <a-switch v-model:checked="readonly" checked-children="编辑" un-checked-children="只读" />
    <ProForm
      :readonly="!readonly"
      :initial-values="{ name: 'Bruce', country: 'china', joinedAt: '2024-01-01' }"
      :submitter="false"
    >
      <ProFormText name="name" label="姓名" />
      <ProFormSelect name="country" label="国家" :value-enum="{ china: '中国', usa: '美国', japan: '日本' }" />
      <ProFormDatePicker name="joinedAt" label="入职时间" />
    </ProForm>
  </div>
</template>
