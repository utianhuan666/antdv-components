<docs lang="zh-CN">
选择器类型，支持 valueEnum 静态选项和 request 远程请求。
</docs>

<docs lang="en-US">
Select type, supports valueEnum for static options and request for remote fetching.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>只读模式（valueEnum）</h4>
      <FieldSelect text="open" mode="read" :value-enum="{ open: '开启', closed: '关闭', pending: '待处理' }" />
    </div>
    <div>
      <h4>编辑模式（valueEnum）</h4>
      <FieldSelect text="open" mode="edit" :value-enum="{ open: '开启', closed: '关闭', pending: '待处理' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldSelect } from '@antdv/components'
</script>
