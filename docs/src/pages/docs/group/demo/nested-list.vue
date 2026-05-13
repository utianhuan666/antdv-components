<docs lang="zh-CN">
表单互相嵌套。
</docs>

<docs lang="en-US">
Nested forms.
</docs>

<script setup lang="ts">
import { ProForm, ProFormGroup, ProFormList, ProFormText } from '@antdv/components'
import { App, Card } from 'antdv-next'
import { h } from 'vue'

const { message } = App.useApp()

async function handleFinish(values: Record<string, any>) {
  message.info(JSON.stringify(values))
  return true
}
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="nested-list-demo" @finish="handleFinish">
      <ProFormText name="name" label="姓名" />
      <ProFormList
        name="users"
        label="用户信息"
        :initial-value="[
          {
            name: '1111',
          },
        ]"
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
      >
        <ProFormGroup>
          <ProFormText name="name" label="姓名" />
          <ProFormText name="nickName" label="昵称" />
        </ProFormGroup>
        <ProFormList
          name="labels"
          label="用户信息"
          :initial-value="[
            {
              value: '333',
              label: '333',
            },
          ]"
          :copy-icon-props="{
            tooltipText: '复制此项到末尾',
          }"
          :delete-icon-props="{
            tooltipText: '不需要这行了',
          }"
        >
          <ProFormGroup key="group">
            <ProFormText name="value" label="值" />
            <ProFormText name="label" label="显示名称" />
          </ProFormGroup>
        </ProFormList>
      </ProFormList>
    </ProForm>
  </div>
</template>
