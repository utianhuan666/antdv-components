<script setup lang="ts">
import { Card, Skeleton } from 'antdv-next'
import ListSkeletonItem from './ListSkeletonItem.vue'

defineOptions({ name: 'ListSkeleton' })

withDefaults(defineProps<{
  size?: number
  active?: boolean
  actionButton?: boolean
}>(), {
  size: 5,
  active: true,
  actionButton: true,
})
</script>

<template>
  <Card
    variant="borderless"
    :styles="{ body: { padding: 0 } }"
  >
    <ListSkeletonItem
      v-for="i in size"
      :key="i"
      :active="active"
    />
    <Card
      v-if="actionButton !== false"
      variant="borderless"
      :style="{ borderStartEndRadius: 0, borderTopLeftRadius: 0 }"
      :styles="{ body: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }"
    >
      <Skeleton.Button
        :style="{ width: '102px' }"
        :active="active"
        size="small"
      />
    </Card>
  </Card>
</template>
