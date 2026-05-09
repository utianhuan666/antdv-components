<docs lang="zh-CN">
使用 `ProForm.Group` / `ProFormGroup` 把字段分组展示，等价 React 版 `ProFormGroup`。
</docs>

<docs lang="en-US">
Group fields with ProForm.Group / ProFormGroup, mirroring React ProFormGroup.
</docs>

<script setup lang="ts">
import { ProForm, ProFormGroup, ProFormText } from '@antdv/components'

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm @finish="handleFinish">
    <ProFormGroup title="基本信息">
      <ProFormText name="name" label="姓名" />
      <ProFormText name="email" label="邮箱" />
    </ProFormGroup>
    <ProFormGroup title="联系方式" :collapsible="true">
      <ProFormText name="phone" label="电话" />
      <ProFormText name="address" label="地址" />
    </ProFormGroup>
  </ProForm>
</template>
