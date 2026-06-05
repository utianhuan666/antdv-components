<script setup lang="ts">
import { Skeleton, SkeletonButton } from 'antdv-next'

defineOptions({ name: 'PageHeaderSkeleton' })

defineProps<{
  active: boolean
}>()
</script>

<template>
  <div :style="{ marginBlockEnd: '16px' }">
    <Skeleton
      :paragraph="false"
      :title="{ width: 185 }"
    />
    <SkeletonButton :active="active" size="small" />
  </div>
</template>
