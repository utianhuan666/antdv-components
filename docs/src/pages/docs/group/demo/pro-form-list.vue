<docs lang="zh-CN">
行为守卫。
</docs>

<docs lang="en-US">
Action guard.
</docs>

<script setup lang="ts">
import type { FormListActionType } from '@antdv/components'
import { ProForm, ProFormGroup, ProFormList, ProFormText } from '@antdv/components'
import { App, Card } from 'antdv-next'
import { h, reactive } from 'vue'

const actionRef = reactive<{ value?: FormListActionType<{ name: string }> }>({})
const { message } = App.useApp()

async function beforeAddRow() {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), 1000)
  })
}

async function beforeRemoveRow(index: number) {
  return new Promise<boolean>((resolve) => {
    if (index === 0) {
      message.error('这行不能删')
      resolve(false)
      return
    }
    setTimeout(() => resolve(true), 1000)
  })
}

function handleAdd() {
  const list = actionRef.value?.getList()
  actionRef.value?.add({
    name: `新增${list?.length}`,
  })
}

function handleRemove() {
  actionRef.value?.remove(1)
}

function handleMove() {
  actionRef.value?.move(1, 0)
}

function handleGet() {
  const row = actionRef.value?.get(1)
  message.info(JSON.stringify(row ?? null))
}

function handleGetList() {
  const row = actionRef.value?.getList()
  message.info(JSON.stringify(row ?? []))
}

async function handleFinish(values: Record<string, any>) {
  message.info(JSON.stringify(values))
  return true
}
</script>

<template>
  <div style="padding: 24px">
    <a-space :style="{ marginBlockEnd: '24px' }">
      <a-button type="primary" @click="handleAdd">
        增加一行
      </a-button>
      <a-button danger @click="handleRemove">
        删除一行
      </a-button>
      <a-button @click="handleMove">
        移动到第一行
      </a-button>
      <a-button type="dashed" @click="handleGet">
        获取一行数据
      </a-button>
      <a-button type="dashed" @click="handleGetList">
        获取所有数据
      </a-button>
    </a-space>
    <ProForm name="pro-form-list-demo" @finish="handleFinish">
      <ProFormList
        name="users"
        label="用户信息"
        :initial-value="[
          {
            name: '1111',
          },
        ]"
        :creator-record="{
          name: '222',
        }"
        :action-guard="{
          beforeAddRow,
          beforeRemoveRow,
        }"
        :item-render="
          ({ listDom, action }: any, { record }: any) =>
            h(
              Card,
              {
                variant: 'outlined',
                extra: action,
                title: record?.name,
                style: {
                  marginBlockEnd: '8px',
                },
              },
              () => listDom,
            )
        "
        :action-ref="actionRef"
      >
        <ProFormGroup key="group">
          <ProFormText name="name" label="姓名" />
          <ProFormText name="age" label="年龄" />
        </ProFormGroup>
      </ProFormList>
    </ProForm>
  </div>
</template>
