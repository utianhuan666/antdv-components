<script setup lang="ts">
import { Card, SkeletonButton } from 'antdv-next'
import DescriptionsItemSkeleton from './DescriptionsItemSkeleton.vue'
import DescriptionsLargeItemSkeleton from './DescriptionsLargeItemSkeleton.vue'

defineOptions({ name: 'DescriptionsSkeleton' })

defineProps<{
  active: boolean
}>()
</script>

<template>
  <Card
    variant="borderless"
    :style="{ borderStartEndRadius: 0, borderTopLeftRadius: 0 }"
  >
    <SkeletonButton
      :active="active"
      size="small"
      :style="{ width: '100px', marginBlockEnd: '16px' }"
    />
    <DescriptionsItemSkeleton :active="active" />
    <DescriptionsLargeItemSkeleton :active="active" />
  </Card>
</template>
