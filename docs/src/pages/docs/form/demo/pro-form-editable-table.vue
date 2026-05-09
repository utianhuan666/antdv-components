<docs lang="zh-CN">
ProForm 和 EditableTable 同时使用，对标 React `pro-form-editableTable.tsx`。当前以 antdv 表格模拟可编辑数据区域。
</docs>

<docs lang="en-US">
Use ProForm with an editable table area, mirroring React `pro-form-editableTable.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormItem, ProFormText } from '@antdv/components'
import { reactive } from 'vue'

const dataSource = reactive([
  { id: 624748504, title: '活动名称一', state: 'open', description: '这个活动真好玩' },
  { id: 624691229, title: '活动名称二', state: 'closed', description: '这个活动真好玩' },
])
const columns = [
  { title: '活动名称', dataIndex: 'title' },
  { title: '状态', dataIndex: 'state' },
  { title: '描述', dataIndex: 'description' },
]

function handleFinish(values: Record<string, any>) {
  console.warn('finish', { ...values, dataSource })
}
</script>

<template>
  <ProForm grid :initial-values="{ name: '蚂蚁设计有限公司', useMode: 'chapter' }" @finish="handleFinish">
    <ProFormGroup>
      <ProFormText width="md" name="name" label="签约客户名称" placeholder="请输入名称" />
      <ProFormText width="md" name="company" label="我方公司名称" placeholder="请输入名称" />
    </ProFormGroup>
    <ProFormText width="sm" name="id" label="主合同编号" />
    <ProFormItem label="数组数据" name="dataSource" :col-props="{ span: 24 }">
      <a-table :columns="columns" :data-source="dataSource" row-key="id" :pagination="false" size="small" />
    </ProFormItem>
  </ProForm>
</template>
