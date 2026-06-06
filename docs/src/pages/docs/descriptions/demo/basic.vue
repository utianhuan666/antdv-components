<script setup lang="ts">
const dataSource = {
  id: 'A-1001',
  status: 0,
  owner: 'Antdv Next',
  progress: 78,
}

const columns = [
  { title: '编号', dataIndex: 'id', copyable: true },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: {
      0: { text: '运行中', status: 'Processing' },
      1: { text: '已完成', status: 'Success' },
    },
  },
  { title: '负责人', dataIndex: 'owner' },
  { title: '进度', dataIndex: 'progress', valueType: 'progress' },
]
</script>

<template>
  <ProDescriptions title="项目详情" :data-source="dataSource" :columns="columns" />
</template>
