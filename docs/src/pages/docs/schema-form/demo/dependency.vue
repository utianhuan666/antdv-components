<script setup lang="ts">
import type { ProFormColumnsType } from '@antdv/components'
import { BetaSchemaForm, ProForm } from '@antdv/components'

const valueEnum = {
  money: { text: '按金额' },
  discount: { text: '按折扣' },
}

const columns: ProFormColumnsType[] = [
  {
    title: '优惠方式',
    dataIndex: 'type',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    valueType: 'select',
    valueEnum,
    width: 'm',
  },
  {
    valueType: 'dependency',
    name: ['type'],
    columns: ({ type }) => {
      if (type === 'money') {
        return [
          {
            dataIndex: 'money',
            title: '优惠金额',
            width: 'm',
            valueType: 'money',
          },
        ]
      }

      if (type === 'discount') {
        return [
          {
            dataIndex: 'discount',
            title: '折扣',
            valueType: 'digit',
            width: 'm',
            fieldProps: {
              precision: 2,
            },
          },
        ]
      }

      return []
    },
  },
]

async function handleFinish() {}
</script>

<template>
  <div style="padding: 24px">
    <h1>普通json表单</h1>
    <BetaSchemaForm :columns="columns" @finish="handleFinish" />
    <h1>嵌套json表单</h1>
    <ProForm
      name="schema-form-dependency-demo"
      :initial-values="{
        type: 'money',
      }"
    >
      <BetaSchemaForm
        layout-type="Embed"
        :columns="columns"
        @finish="handleFinish"
      />
    </ProForm>
  </div>
</template>
