<docs lang="zh-CN">
文本类型，最基本的字段组件。支持只读和编辑模式切换。
</docs>

<docs lang="en-US">
Text type, the most basic field component. Supports read and edit mode switching.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>只读模式</h4>
      <FieldText text="这是一段文本" mode="read" />
    </div>
    <div>
      <h4>编辑模式</h4>
      <FieldText text="可编辑文本" mode="edit" />
    </div>
    <div>
      <h4>空值显示</h4>
      <FieldText :text="undefined" mode="read" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldText } from '@antdv/components'
</script>
