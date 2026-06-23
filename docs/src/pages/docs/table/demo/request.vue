<script setup lang="ts">
import { ProTable } from '@antdv/components'

const columns = [
  { title: '姓名', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status', valueEnum: { 0: { text: '关闭' }, 1: { text: '运行中' } } },
]

async function request() {
  return {
    success: true,
    total: 1,
    data: [{ id: 1, name: 'Server Row', status: 1 }],
  }
}
</script>

<template>
  <ProTable row-key="id" :columns="columns" :request="request" />
</template>
