<script setup lang="ts">
import { Card, Skeleton } from 'antdv-next'
import SkeletonLine from './SkeletonLine.vue'

defineOptions({ name: 'ListSkeletonItem' })

withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <div>
    <Card
      variant="borderless"
      :style="{ borderRadius: 0 }"
      :styles="{ body: { padding: '24px' } }"
    >
      <div
        style="width: 100%; display: flex; align-items: center; justify-content: space-between;"
      >
        <div style="max-width: 100%; flex: 1;">
          <Skeleton
            :active="active"
            :title="{ width: '100px' }"
            :paragraph="{ rows: 1 }"
            :styles="{ title: { marginBlockStart: 0 }, paragraph: { margin: 0 } }"
          />
        </div>
        <Skeleton.Button
          :active="active"
          size="small"
          :style="{ width: '165px', marginBlockStart: '12px' }"
        />
      </div>
    </Card>
    <SkeletonLine />
  </div>
</template>
