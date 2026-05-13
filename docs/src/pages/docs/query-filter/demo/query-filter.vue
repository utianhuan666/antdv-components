<docs lang="zh-CN">
基本使用，对标 React `demos/form/QueryFilter/query-filter.tsx`。
</docs>

<docs lang="en-US">
Basic usage. Mirrors React `query-filter.tsx`.
</docs>

<script setup lang="ts">
import { ProFormDateTimePicker, ProFormText, QueryFilter } from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <QueryFilter>
      <ProFormDateTimePicker
        label="下单时间"
        :col-props="{ xl: 12 }"
        name="orderTime"
        required
      />
      <ProFormText disabled :col-props="{ xl: 12 }" name="pay" label="支付方式" />
    </QueryFilter>
  </div>
</template>
