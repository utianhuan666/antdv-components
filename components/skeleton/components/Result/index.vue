<script setup lang="ts">
import { Card, Skeleton, Space } from 'antdv-next'
import PageHeaderSkeleton from '../List/PageHeaderSkeleton.vue'

defineOptions({ name: 'ResultPageSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  pageHeader?: boolean
}>(), {
  active: true,
})
</script>

<template>
  <div style="width: 100%;">
    <PageHeaderSkeleton v-if="pageHeader !== false" :active="active" />
    <Card>
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 128px;
        "
      >
        <Skeleton.Avatar
          :size="64"
          :style="{ marginBlockEnd: '32px' }"
        />
        <Skeleton.Button
          :active="active"
          :style="{ width: '214px', marginBlockEnd: '8px' }"
        />
        <Skeleton.Button
          :active="active"
          :style="{ width: '328px' }"
          size="small"
        />
        <Space :style="{ marginBlockStart: '24px' }">
          <Skeleton.Button :active="active" :style="{ width: '116px' }" />
          <Skeleton.Button :active="active" :style="{ width: '116px' }" />
        </Space>
      </div>
    </Card>
  </div>
</template>
