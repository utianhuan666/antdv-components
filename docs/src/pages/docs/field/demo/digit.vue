<docs lang="zh-CN">
数字类型，支持千分位格式化和精度控制。
</docs>

<docs lang="en-US">
Digit type, supports thousand separator formatting and precision control.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>数字 - 只读</h4>
      <FieldDigit :text="1234567" mode="read" />
    </div>
    <div>
      <h4>百分比 - 只读</h4>
      <FieldPercent :text="88.5" mode="read" />
    </div>
    <div>
      <h4>数字范围 - 只读</h4>
      <FieldDigitRange :text="[10, 100]" mode="read" />
    </div>
    <div>
      <h4>数字 - 编辑</h4>
      <FieldDigit :text="100" mode="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldDigit, FieldDigitRange, FieldPercent } from '@antdv/components'
</script>
