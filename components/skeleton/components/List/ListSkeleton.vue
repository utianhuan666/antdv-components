<script setup lang="ts">
import { Card, SkeletonButton } from 'antdv-next'
import ListSkeletonItem from './ListSkeletonItem.vue'

defineOptions({ name: 'ListSkeleton' })

withDefaults(defineProps<{
  size: number
  active?: boolean
  actionButton?: false
}>(), {
  active: true,
  actionButton: undefined,
})
</script>

<template>
  <Card
    variant="borderless"
    :styles="{ body: { padding: 0 } }"
  >
    <ListSkeletonItem
      v-for="index in size"
      :key="index"
      :active="!!active"
    />
    <Card
      v-if="actionButton !== false"
      variant="borderless"
      :style="{ borderStartEndRadius: 0, borderTopLeftRadius: 0 }"
      :styles="{ body: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }"
    >
      <SkeletonButton
        :style="{ width: '102px' }"
        :active="active"
        size="small"
      />
    </Card>
  </Card>
</template>
