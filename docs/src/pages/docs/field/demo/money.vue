<docs lang="zh-CN">
金额类型，自动格式化显示货币符号和千分位分隔符。
</docs>

<docs lang="en-US">
Money type, automatically formats currency symbol and thousand separators.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>金额 - 只读</h4>
      <FieldMoney :text="1234567.89" mode="read" />
    </div>
    <div>
      <h4>金额 - 编辑</h4>
      <FieldMoney :text="1000" mode="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldMoney } from '@antdv/components'
</script>
