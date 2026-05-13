<script setup lang="ts">
import type { ProFormColumnsType } from '@antdv/components'
import { BetaSchemaForm } from '@antdv/components'
import { Input } from 'antdv-next'
import { h } from 'vue'

const valueEnum = {
  all: { text: '全部', status: 'Default' },
  open: {
    text: '未解决',
    status: 'Error',
  },
  closed: {
    text: '已解决',
    status: 'Success',
    disabled: true,
  },
  processing: {
    text: '解决中',
    status: 'Processing',
  },
}

const columns: ProFormColumnsType[] = [
  {
    title: '标题',
    dataIndex: 'title',
    initialValue: '必填',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
    width: 'm',
  },
  {
    title: '必填但没显示*',
    dataIndex: 'list',
    valueType: 'formList',
    formItemProps: {
      rules: [{ required: true, message: '请填写列表' }],
    },
    columns: [
      {
        dataIndex: 'isSettlement',
        valueType: 'switch',
        formItemProps: {
          rules: [{ required: true, message: '请填写1' }],
        },
      },
    ],
  },
  {
    title: '状态',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum,
    width: 'm',
    tooltip: '当title为disabled时状态无法选择',
    dependencies: ['title'],
    fieldProps: (form) => {
      if (form.getFieldValue('title') === 'disabled') {
        return {
          disabled: true,
          placeholder: 'disabled',
        }
      }
      else {
        return {
          placeholder: 'normal',
        }
      }
    },
  },
  {
    title: '标签',
    dataIndex: 'labels',
    width: 'm',
    tooltip: '当title为必填时此项将为必填',
    dependencies: ['title'],
    formItemProps(form) {
      if (form.getFieldValue('title') === '必填') {
        return {
          rules: [
            {
              required: true,
            },
          ],
        }
      }
      else {
        return {}
      }
    },
  },
  {
    valueType: 'dependency',
    name: ['title'],
    columns: ({ title }) => {
      return title !== 'hidden'
        ? [
            {
              title: 'title为hidden时隐藏',
              dataIndex: 'hidden',
              valueType: 'date',
              formItemRender: () => {
                return h(Input)
              },
            },
          ]
        : []
    },
  },
  {
    title: '创建时间',
    key: 'showTime',
    dataIndex: 'createName',
    valueType: 'date',
  },
  {
    valueType: 'divider',
  },
]

async function handleFinish() {}
</script>

<template>
  <div style="padding: 24px">
    <BetaSchemaForm
      :should-update="false"
      layout-type="Form"
      :columns="columns"
      @finish="handleFinish"
    />
  </div>
</template>
