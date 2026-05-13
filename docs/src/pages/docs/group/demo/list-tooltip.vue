<docs lang="zh-CN">
自定义删除和复制的 tooltip。
</docs>

<docs lang="en-US">
Customize delete and copy tooltips.
</docs>

<script setup lang="ts">
import { CloseCircleOutlined, SmileOutlined } from '@antdv-next/icons'
import { ProForm, ProFormGroup, ProFormList, ProFormText } from '@antdv/components'
import { App } from 'antdv-next'
import { shallowRef } from 'vue'

const readonly = shallowRef(false)
const { message } = App.useApp()

const segmentedOptions = [
  {
    label: '编辑',
    title: '编辑',
    value: 'edit',
  },
  {
    label: '只读',
    title: '只读',
    value: 'readonly',
  },
]

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
      <a-segmented
        block
        :options="segmentedOptions"
        @change="value => (readonly = value === 'readonly')"
      />
      <ProForm
        name="list-tooltip-demo"
        :readonly="readonly"
        @finish="handleFinish"
      >
        <ProFormText name="name" label="姓名" />
        <ProFormList
          name="labels"
          label="用户信息"
          :initial-value="[
            {
              value: '333',
              label: '333',
            },
          ]"
          :copy-icon-props="{ Icon: SmileOutlined, tooltipText: '复制此项到末尾' }"
          :delete-icon-props="{
            Icon: CloseCircleOutlined,
            tooltipText: '不需要这行了',
          }"
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
