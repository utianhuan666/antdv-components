<script setup lang="ts">
import { Card, Skeleton } from 'antdv-next'
import DescriptionsItemSkeleton from './DescriptionsItemSkeleton.vue'
import DescriptionsLargeItemSkeleton from './DescriptionsLargeItemSkeleton.vue'

defineOptions({ name: 'DescriptionsSkeleton' })

withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <Card
    variant="borderless"
    :style="{ borderStartEndRadius: 0, borderTopLeftRadius: 0 }"
  >
    <Skeleton.Button
      :active="active"
      size="small"
      :style="{ width: '100px', marginBlockEnd: '16px' }"
    />
    <DescriptionsItemSkeleton :active="active" />
    <DescriptionsLargeItemSkeleton :active="active" />
  </Card>
</template>
