<script setup lang="ts">
import { ProTable } from '@antdv/components'

const columns = [
  { title: '姓名', dataIndex: 'name' },
  { title: '年龄', dataIndex: 'age', valueType: 'digit' },
]

const dataSource = [
  { id: 1, name: 'Jack', age: 18 },
  { id: 2, name: 'Lucy', age: 20 },
]
</script>

<template>
  <ProTable row-key="id" :search="false" :columns="columns" :data-source="dataSource" />
</template>
