<script setup lang="ts">
import { Skeleton } from 'antdv-next'

defineOptions({ name: 'PageHeaderSkeleton' })

withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <div style="margin-block-end: 16px;">
    <Skeleton
      :paragraph="false"
      :styles="{ title: { width: '185px' } }"
    />
    <Skeleton.Button :active="active" size="small" />
  </div>
</template>
