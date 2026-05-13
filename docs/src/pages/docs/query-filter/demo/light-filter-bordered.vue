<docs lang="zh-CN">
轻量筛选 - 带边框样式，对标 React `demos/form/QueryFilter/light-filter-bordered.tsx`。
</docs>

<docs lang="en-US">
LightFilter with outlined variant. Mirrors React `light-filter-bordered.tsx`.
</docs>

<script setup lang="ts">
import {
  LightFilter,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <LightFilter variant="outlined">
      <ProFormText name="name" label="名称" />
      <ProFormSelect
        name="sex"
        label="性别"
        :options="[
          { label: '男', value: 'man' },
          { label: '女', value: 'woman' },
        ]"
      />
      <ProFormDatePicker name="date" label="日期" />
      <ProFormDateRangePicker name="createDate" label="创建时间" />
    </LightFilter>
  </div>
</template>
