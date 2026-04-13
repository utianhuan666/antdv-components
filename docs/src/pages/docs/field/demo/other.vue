<docs lang="zh-CN">
其他字段类型：进度条、图片、代码、相对时间、状态等。
</docs>

<docs lang="en-US">
Other field types: progress, image, code, relative time, status, etc.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>进度条 - 只读</h4>
      <FieldProgress :text="75" mode="read" />
    </div>
    <div>
      <h4>图片 - 只读</h4>
      <FieldImage text="https://via.placeholder.com/100" mode="read" />
    </div>
    <div>
      <h4>代码 - 只读</h4>
      <FieldCode text='{"name": "test", "value": 123}' mode="read" language="json" />
    </div>
    <div>
      <h4>相对时间 - 只读</h4>
      <FieldFromNow text="2025-01-01" mode="read" />
    </div>
    <div>
      <h4>状态</h4>
      <FieldStatus text="success" mode="read" />
    </div>
    <div>
      <h4>序号列</h4>
      <FieldIndexColumn :text="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldProgress, FieldImage, FieldCode, FieldFromNow, FieldStatus, FieldIndexColumn } from '@antdv/components'
</script>
