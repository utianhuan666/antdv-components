<script setup lang="ts">
import { Card, Skeleton, SkeletonButton } from 'antdv-next'
import SkeletonLine from './SkeletonLine.vue'

defineOptions({ name: 'ListSkeletonItem' })

defineProps<{
  active: boolean
}>()
</script>

<template>
  <Card
    variant="borderless"
    :style="{ borderRadius: 0 }"
    :styles="{ body: { padding: 24 } }"
  >
    <div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
      <div style="max-width: 100%; flex: 1;">
        <Skeleton
          :active="active"
          :title="{ width: 100 }"
          :paragraph="{ rows: 1 }"
          :styles="{
            title: { marginBlockStart: 0 },
            paragraph: { margin: 0 },
          }"
        />
      </div>
      <SkeletonButton
        :active="active"
        size="small"
        :style="{ width: '165px', marginBlockStart: '12px' }"
      />
    </div>
  </Card>
  <SkeletonLine />
</template>
