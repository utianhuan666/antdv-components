<docs lang="zh-CN">
启用 `grid` 后，每个字段会自动包一层 `Col`，可通过 `colProps` 控制每项栅格宽度，等价 React 版 `ProForm` 的栅格能力。
</docs>

<docs lang="en-US">
With `grid` enabled, each field is wrapped in a Col, and `colProps` controls span.
</docs>

<script setup lang="ts">
import { ProForm, ProFormDatePicker, ProFormSelect, ProFormText } from '@antdv/components'

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm
    grid
    :col-props="{ xs: 24, md: 12 }"
    :row-props="{ gutter: 16 }"
    :initial-values="{ orderNo: 'A0001' }"
    @finish="handleFinish"
  >
    <ProFormText name="orderNo" label="订单号" />
    <ProFormText name="customer" label="客户" />
    <ProFormSelect name="status" label="状态" :value-enum="{ pending: '待处理', done: '已完成' }" />
    <ProFormDatePicker name="createdAt" label="创建时间" />
  </ProForm>
</template>
