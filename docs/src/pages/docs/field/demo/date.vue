<docs lang="zh-CN">
日期类型，支持多种日期格式和选择器模式。
</docs>

<docs lang="en-US">
Date type, supports multiple date formats and picker modes.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>日期 - 只读</h4>
      <FieldDatePicker text="2025-01-15" mode="read" />
    </div>
    <div>
      <h4>日期时间 - 只读</h4>
      <FieldDatePicker text="2025-01-15 14:30:00" mode="read" format="YYYY-MM-DD HH:mm:ss" show-time />
    </div>
    <div>
      <h4>日期范围 - 只读</h4>
      <FieldRangePicker :text="['2025-01-01', '2025-01-15']" mode="read" />
    </div>
    <div>
      <h4>日期 - 编辑</h4>
      <FieldDatePicker text="2025-01-15" mode="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldDatePicker, FieldRangePicker } from '@antdv/components'
</script>
