<docs lang="zh-CN">
这是从参考仓库迁移过来的 demo 能力示例。`demo` 会解析 `src`，读取当前文件源码，并把这个说明块作为描述区渲染出来。
</docs>

<docs lang="en-US">
This demo exercises the migrated `demo` pipeline. The docs block becomes the description, and the source is extracted automatically.
</docs>

<script setup lang="ts">
import { CheckCircleFilled } from '@antdv-next/icons'
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <a-flex gap="small" align="center" wrap>
    <my-button type="primary" @click="count += 1">
      Click {{ count }}
      <template #icon>
        <CheckCircleFilled />
      </template>
    </my-button>
    <a-tag color="blue"> markdown + demo </a-tag>
  </a-flex>
</template>
