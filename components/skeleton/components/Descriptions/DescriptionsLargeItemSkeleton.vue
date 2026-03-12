<script setup lang="ts">
import { Skeleton } from 'antdv-next'

defineOptions({ name: 'DescriptionsLargeItemSkeleton' })

withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <div style="margin-block-start: 32px;">
    <Skeleton.Button
      :active="active"
      size="small"
      :style="{ width: '100px', marginBlockEnd: '16px' }"
    />
    <div style="width: 100%; justify-content: space-between; display: flex;">
      <div style="flex: 1; margin-inline-end: 24px; max-width: 300px;">
        <Skeleton
          :active="active"
          :paragraph="false"
          :styles="{ title: { marginBlockStart: 0 } }"
        />
        <Skeleton
          :active="active"
          :paragraph="false"
          :styles="{ title: { marginBlockStart: '8px' } }"
        />
        <Skeleton
          :active="active"
          :paragraph="false"
          :styles="{ title: { marginBlockStart: '8px' } }"
        />
      </div>
      <div style="flex: 1; align-items: center; justify-content: center;">
        <div style="max-width: 300px; margin: auto;">
          <Skeleton
            :active="active"
            :paragraph="false"
            :styles="{ title: { marginBlockStart: 0 } }"
          />
          <Skeleton
            :active="active"
            :paragraph="false"
            :styles="{ title: { marginBlockStart: '8px' } }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
