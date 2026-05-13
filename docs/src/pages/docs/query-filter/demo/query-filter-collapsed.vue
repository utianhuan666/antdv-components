<docs lang="zh-CN">
查询筛选 - 默认收起。对标 React `demos/form/QueryFilter/query-filter-collapsed.tsx`。
</docs>

<docs lang="en-US">
Default collapsed. Mirrors React `query-filter-collapsed.tsx`.
</docs>

<script setup lang="ts">
import { ProFormDatePicker, ProFormText, QueryFilter } from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <QueryFilter default-collapsed split>
      <ProFormText name="name" label="应用名称" />
      <ProFormDatePicker name="createDate" label="创建时间" />
      <ProFormText name="status" label="应用状态" />
      <ProFormDatePicker name="replyDate" label="响应日期" />
      <ProFormDatePicker name="startDate" label="创建时间" />
      <ProFormDatePicker name="endDate" label="结束时间" />
    </QueryFilter>
  </div>
</template>
