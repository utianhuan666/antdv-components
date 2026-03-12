<script setup lang="ts">
import { Card, Skeleton } from 'antdv-next'
import TableItemSkeleton from './TableItemSkeleton.vue'

defineOptions({ name: 'TableSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  size?: number
}>(), {
  active: true,
  size: 4,
})
</script>

<template>
  <Card variant="borderless">
    <Skeleton.Button
      :active="active"
      size="small"
      :style="{ width: '100px', marginBlockEnd: '16px' }"
    />
    <TableItemSkeleton :active="active" :header="true" />
    <TableItemSkeleton
      v-for="i in size"
      :key="i"
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
