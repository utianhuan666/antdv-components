<docs lang="zh-CN">
基础卡片和折叠卡片。
</docs>

<script setup lang="ts">
import { ref } from 'vue'

const collapsed = ref(false)
</script>

<template>
  <ProCard title="基础卡片" header-bordered>
    <ProCard
      title="可折叠区域"
      header-bordered
      collapsible
      :collapsed="collapsed"
      @collapse="collapsed = $event"
    >
      内容区域
    </ProCard>
  </ProCard>
</template>
