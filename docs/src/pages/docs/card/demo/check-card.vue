<docs lang="zh-CN">
使用 CheckCard.Group 管理单选状态。
</docs>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref<string>()
</script>

<template>
  <CheckCard.Group
    v-model:value="value"
    :options="[
      { title: '苹果', value: 'Apple', description: '红色水果' },
      { title: '梨', value: 'Pear', description: '清甜爽口' },
      { title: '橙子', value: 'Orange', description: '富含维生素' },
    ]"
  />
</template>
