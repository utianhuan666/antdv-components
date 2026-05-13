<docs lang="zh-CN">
增删条目限制。
</docs>

<docs lang="en-US">
Limit item count.
</docs>

<script setup lang="ts">
import type { FormListActionType } from '@antdv/components'
import { CloseOutlined, SnippetsOutlined } from '@antdv-next/icons'
import { ProForm, ProFormList, ProFormText } from '@antdv/components'
import { reactive } from 'vue'

const actionRef = reactive<{ value?: FormListActionType<{ name: string }> }>({})

async function beforeAddRow() {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), 1000)
  })
}

async function beforeRemoveRow(index: number) {
  actionRef.value?.get(index)
  return new Promise<boolean>((resolve) => {
    if (index === 0) {
      resolve(false)
      return
    }
    setTimeout(() => resolve(true), 1000)
  })
}
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="group-countlimit-demo">
      <ProFormList
        :copy-icon-props="{
          Icon: SnippetsOutlined,
        }"
        :delete-icon-props="{
          Icon: CloseOutlined,
        }"
        :min="1"
        :max="4"
        :action-ref="actionRef"
        :action-guard="{
          beforeAddRow,
          beforeRemoveRow,
        }"
        name="users"
        label="用户信息"
        :initial-value="[
          {
            name: '1111',
          },
        ]"
      >
        <ProFormText key="useMode" name="name" label="姓名" />
      </ProFormList>
    </ProForm>
  </div>
</template>
