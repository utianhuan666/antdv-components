<docs lang="zh-CN">
轻量筛选 - 自定义 Footer，对标 React `demos/form/QueryFilter/light-filter-footer.tsx`。
</docs>

<docs lang="en-US">
LightFilter with custom footer. Mirrors React `light-filter-footer.tsx`.
</docs>

<script setup lang="ts">
import { LightFilter, ProFormDatePicker, ProFormText } from '@antdv/components'
import { Button, Space } from 'antdv-next'
import { h } from 'vue'

function footerRender(onConfirm?: (event?: MouseEvent) => void, onClear?: (event?: MouseEvent) => void) {
  return h(Space, null, () => [
    h(Button, {
      size: 'small',
      onClick: (event: MouseEvent) => onClear?.(event),
    }, () => '重置'),
    h(Button, {
      size: 'small',
      type: 'primary',
      onClick: (event: MouseEvent) => onConfirm?.(event),
    }, () => '确认'),
  ])
}
</script>

<template>
  <div style="padding: 24px">
    <LightFilter :footer-render="footerRender">
      <ProFormText name="name" label="姓名" />
      <ProFormDatePicker name="date" label="日期" secondary />
    </LightFilter>
  </div>
</template>
