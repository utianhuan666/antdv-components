<docs lang="zh-CN">
密码类型，只读模式下默认隐藏文本，可点击眼睛图标切换显示。
</docs>

<docs lang="en-US">
Password type, text is hidden by default in read mode, toggle visibility with the eye icon.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>只读模式（可切换显示）</h4>
      <FieldPassword text="my-secret-password" mode="read" />
    </div>
    <div>
      <h4>编辑模式</h4>
      <FieldPassword text="" mode="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldPassword } from '@antdv/components'
</script>
