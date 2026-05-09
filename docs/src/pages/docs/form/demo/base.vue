<docs lang="zh-CN">
基础用法。配合 `ProFormText`、`ProFormSelect` 等字段组件构建表单。
</docs>

<docs lang="en-US">
Basic usage. Use ProFormText / ProFormSelect to build a form.
</docs>

<script setup lang="ts">
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@antdv/components'

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm
    :initial-values="{ name: 'Bruce', country: 'china' }"
    :submitter="{ searchConfig: { submitText: '提交', resetText: '重置' } }"
    @finish="handleFinish"
  >
    <ProFormText
      name="name"
      label="姓名"
      placeholder="请输入姓名"
      :rules="[{ required: true, message: '请输入姓名' }]"
    />
    <ProFormSelect
      name="country"
      label="国家"
      :value-enum="{ china: '中国', usa: '美国', japan: '日本' }"
      placeholder="请选择国家"
    />
    <ProFormTextArea name="remark" label="备注" placeholder="请输入备注" />
  </ProForm>
</template>
