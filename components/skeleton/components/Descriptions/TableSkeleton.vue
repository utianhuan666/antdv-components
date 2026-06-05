<script setup lang="ts">
import { Card, Skeleton, SkeletonButton } from 'antdv-next'
import TableItemSkeleton from './TableItemSkeleton.vue'

defineOptions({ name: 'TableSkeleton' })

withDefaults(defineProps<{
  active: boolean
  size?: number
}>(), {
  size: 4,
})
</script>

<template>
  <Card variant="borderless">
    <SkeletonButton
      :active="active"
      size="small"
      :style="{ width: '100px', marginBlockEnd: '16px' }"
    />
    <TableItemSkeleton header :active="active" />
    <TableItemSkeleton
      v-for="index in size"
      :key="index"
      :active="active"
    />
    <div style="display: flex; justify-content: flex-end; padding-block-start: 16px;">
      <Skeleton
        :active="active"
        :paragraph="false"
        :styles="{ title: { margin: 0, height: '32px', float: 'right', maxWidth: '630px' } }"
      />
    </div>
  </Card>
</template>
