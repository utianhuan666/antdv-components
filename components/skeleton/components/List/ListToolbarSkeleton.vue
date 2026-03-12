<script setup lang="ts">
import { Card, Skeleton, Space } from 'antdv-next'

defineOptions({ name: 'ListToolbarSkeleton' })

withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <Card
    variant="borderless"
    :style="{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }"
    :styles="{ body: { paddingBlockEnd: '8px' } }"
  >
    <Space style="width: 100%; justify-content: space-between;">
      <Skeleton.Button :active="active" :style="{ width: '200px' }" size="small" />
      <Space>
        <Skeleton.Button :active="active" size="small" :style="{ width: '120px' }" />
        <Skeleton.Button :active="active" size="small" :style="{ width: '80px' }" />
      </Space>
    </Space>
  </Card>
</template>
