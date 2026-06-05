<script setup lang="ts">
import { Card, SkeletonButton, Space } from 'antdv-next'

defineOptions({ name: 'ListToolbarSkeleton' })

defineProps<{
  active: boolean
}>()
</script>

<template>
  <Card
    variant="borderless"
    :style="{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }"
    :styles="{ body: { paddingBlockEnd: 8 } }"
  >
    <Space :style="{ width: '100%', justifyContent: 'space-between' }">
      <SkeletonButton :active="active" :style="{ width: '200px' }" size="small" />
      <Space>
        <SkeletonButton :active="active" size="small" :style="{ width: '120px' }" />
        <SkeletonButton :active="active" size="small" :style="{ width: '80px' }" />
      </Space>
    </Space>
  </Card>
</template>
