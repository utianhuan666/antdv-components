<script setup lang="ts">
import { ref } from 'vue'

const actionRef = ref()
const params = ref({ id: 1 })

const columns = [
  { title: '标题', dataIndex: 'title' },
  { title: '日期', dataIndex: 'date', valueType: 'date' },
  { title: '金额', dataIndex: 'money', valueType: 'money' },
]
</script>

<template>
  <ProDescriptions
    title="请求详情"
    :action-ref="actionRef"
    :params="params"
    :columns="columns"
    :request="async () => ({
      success: true,
      data: {
        title: '这是一段文本',
        date: '20200730',
        money: '12121',
      },
    })"
  />
</template>
