<docs lang="zh-CN">
轻量筛选 - 全部收起，对标 React `demos/form/QueryFilter/light-filter-collapse.tsx`。
</docs>

<docs lang="en-US">
LightFilter with all items collapsed. Mirrors React `light-filter-collapse.tsx`.
</docs>

<script setup lang="ts">
import { LightFilter, ProFormDatePicker, ProFormSelect, ProFormText } from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <LightFilter collapse>
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
    </LightFilter>
  </div>
</template>
