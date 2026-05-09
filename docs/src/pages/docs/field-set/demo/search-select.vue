<docs lang="zh-CN">
对标 React `demos/form/FieldSet/search-select.tsx`，展示查询选择字段的 request、valueEnum 和本地选项写法。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/search-select.tsx`, showcasing request, valueEnum and local options select fields.
</docs>

<script setup lang="ts">
import { ProForm, ProFormGroup, ProFormSelect } from '@antdv/components'
import { App } from 'antdv-next'
import { shallowRef } from 'vue'

const readonly = shallowRef(false)
const { message } = App.useApp()

const options = [
  { label: 'All', value: 'all' },
  { label: 'Unresolved', value: 'open' },
  { label: 'Resolved', value: 'closed' },
  { label: 'In Progress', value: 'processing' },
]

async function requestOptions(params?: Record<string, any>) {
  const keyWords = params?.keyWords || ''
  return options.filter(({ value, label }) => value.includes(keyWords) || label.includes(keyWords))
}

async function handleFinish() {
  message.success('Submitted')
  return true
}
</script>

<template>
  <a-switch
    v-model:checked="readonly"
    checked-children="Edit"
    un-checked-children="Read Only"
    style="margin-block-end: 16px"
  />
  <ProForm name="search-select-demo" :readonly="readonly" @finish="handleFinish">
    <ProFormGroup>
      <ProFormSelect
        name="userQuery"
        label="Query Selector - request"
        :request="requestOptions"
        :field-props="{ labelInValue: true, showSearch: true, style: { minWidth: '140px' } }"
      />
      <ProFormSelect
        name="userQuery2"
        label="Query Selector - valueEnum"
        :value-enum="{
          all: { text: 'All', status: 'Default' },
          open: { text: 'Unresolved', status: 'Error' },
          closed: { text: 'Resolved', status: 'Success' },
          processing: { text: 'In Progress', status: 'Processing' },
        }"
        :field-props="{ showSearch: true, style: { minWidth: '140px' } }"
      />
      <ProFormSelect
        name="userQuery3"
        label="Query Selector - options"
        :field-props="{ labelInValue: false, showSearch: true, options, style: { minWidth: '140px' } }"
      />
    </ProFormGroup>
  </ProForm>
</template>
