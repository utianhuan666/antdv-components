<script setup lang="ts">
import { Card, SkeletonAvatar, SkeletonButton, Space } from 'antdv-next'
import PageHeaderSkeleton from '../List/PageHeaderSkeleton.vue'

defineOptions({ name: 'ResultPageSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  pageHeader?: false
}>(), {
  active: true,
  pageHeader: undefined,
})
</script>

<template>
  <div style="width: 100%;">
    <PageHeaderSkeleton v-if="pageHeader !== false" :active="active" />
    <Card>
      <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 128px;">
        <SkeletonAvatar
          :size="64"
          :style="{ marginBlockEnd: '32px' }"
        />
        <SkeletonButton
          :active="active"
          :style="{ width: '214px', marginBlockEnd: '8px' }"
        />
        <SkeletonButton
          :active="active"
          :style="{ width: '328px' }"
          size="small"
        />
        <Space :style="{ marginBlockStart: '24px' }">
          <SkeletonButton :active="active" :style="{ width: '116px' }" />
          <SkeletonButton :active="active" :style="{ width: '116px' }" />
        </Space>
      </div>
    </Card>
  </div>
</template>
