<docs lang="zh-CN">
查询筛选 - 垂直布局，对标 React `demos/form/QueryFilter/query-filter-vertical.tsx`。
</docs>

<docs lang="en-US">
Vertical layout. Mirrors React `query-filter-vertical.tsx`.
</docs>

<script setup lang="ts">
import {
  ProFormCheckboxGroup,
  ProFormDatePicker,
  ProFormRadioGroup,
  ProFormText,
  QueryFilter,
} from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <QueryFilter layout="vertical">
      <ProFormText name="name" label="这是一个超级超级长的名称" />
      <ProFormDatePicker name="birth" label="创建时间" />
      <ProFormText name="sex" label="应用状态" />
      <ProFormRadioGroup
        name="freq"
        label="查询频度"
        :options="[
          { value: 'weekly', label: '每周' },
          { value: 'quarterly', label: '每季度' },
          { value: 'monthly', label: '每月' },
          { value: 'yearly', label: '每年' },
        ]"
      />
      <ProFormCheckboxGroup
        name="checkbox"
        label="行业分布"
        :options="['农业', '制造业', '互联网']"
      />
    </QueryFilter>
  </div>
</template>
