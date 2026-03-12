<docs lang="zh-CN">
通过 active 参数控制是否显示动画效果。
</docs>

<docs lang="en-US">
Control the animated pulse effect via the active prop.
</docs>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(true)
</script>

<template>
  <div>
    <a-space style="margin-block-end: 16px;">
      <a-switch v-model:checked="active" />
      <span>active: {{ active }}</span>
    </a-space>
    <div style="background: #fafafa; padding: 24px;">
      <ProSkeleton type="list" :active="active" :list="3" :statistic="false" />
    </div>
  </div>
</template>
