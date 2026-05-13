<docs lang="zh-CN">
箭头排序。
</docs>

<docs lang="en-US">
Arrow sort.
</docs>

<script setup lang="ts">
import { ProForm, ProFormGroup, ProFormList, ProFormText } from '@antdv/components'
import { App } from 'antdv-next'

const { message } = App.useApp()

async function handleFinish(values: Record<string, any>) {
  message.info(JSON.stringify(values))
  return true
}
</script>

<template>
  <div style="padding: 24px">
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }"
    >
      <ProForm
        name="list-arrowsort-demo"
        @finish="handleFinish"
      >
        <ProFormText name="name" label="姓名" />

        <ProFormList
          name="labels"
          label="用户信息"
          :initial-value="[
            {
              value: '111',
              label: '111',
            },
            {
              value: '222',
              label: '222',
            },
            {
              value: '333',
              label: '333',
            },
          ]"
          :arrow-sort="true"
          :up-icon-props="{ tooltipText: '' }"
        >
          <ProFormGroup key="group">
            <ProFormText name="value" label="值" />
            <ProFormText name="label" label="显示名称" />
          </ProFormGroup>
        </ProFormList>
      </ProForm>
    </div>
  </div>
</template>
