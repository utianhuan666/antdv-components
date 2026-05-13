<script setup lang="ts">
import type { ProFormColumnsType } from '@antdv/components'
import { BetaSchemaForm, ProForm, ProFormSelect, ProFormText } from '@antdv/components'

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
    title: '状态',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum,
    width: 'm',
  },
]
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="schema-form-embed-demo">
      <h1>ProForm </h1>
      <ProFormText name="username" />
      <ProFormSelect
        name="select-multiple"
        label="多选"
        :value-enum="{
          red: 'Red',
          green: 'Green',
          blue: 'Blue',
        }"
        :field-props="{
          mode: 'multiple',
        }"
        placeholder="Please select favorite colors"
        :rules="[
          {
            required: true,
            message: 'Please select your favorite colors!',
            type: 'array',
          },
        ]"
      />
      <h1>表单1 </h1>
      <BetaSchemaForm layout-type="Embed" :columns="columns" />
      <h1>表单2</h1>
      <BetaSchemaForm
        layout-type="Embed"
        :columns="[
          {
            title: '创建时间',
            key: 'showTime',
            dataIndex: 'createName',
            valueType: 'date',
          },
          {
            title: '分组',
            valueType: 'group',
            columns: [
              {
                title: '状态',
                dataIndex: 'groupState',
                valueType: 'select',
                width: 'xs',
                valueEnum,
              },
              {
                title: '标题',
                width: 'md',
                dataIndex: 'groupTitle',
                formItemProps: {
                  rules: [
                    {
                      required: true,
                      message: '此项为必填项',
                    },
                  ],
                },
              },
            ],
          },
        ]"
      />
    </ProForm>
  </div>
</template>
