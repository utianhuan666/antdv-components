<docs lang="zh-CN">
labelCol 示例，对标 React `label-col.tsx`。
</docs>

<docs lang="en-US">
labelCol example, mirroring React `label-col.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormText } from '@antdv/components'
</script>

<template>
  <ProForm :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" layout="horizontal">
    <ProFormText name="name" label="Contract Customer Name" />
    <ProFormText name="company" label="Our Company Name" />
  </ProForm>
</template>
