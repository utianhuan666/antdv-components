<script setup lang="ts">
import { Card } from 'antdv-next'
import ListSkeleton from './ListSkeleton.vue'
import ListToolbarSkeleton from './ListToolbarSkeleton.vue'
import PageHeaderSkeleton from './PageHeaderSkeleton.vue'
import StatisticSkeleton from './StatisticSkeleton.vue'

defineOptions({ name: 'ListPageSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  pageHeader?: boolean
  statistic?: number | false
  actionButton?: boolean
  toolbar?: boolean
  list?: number | false
}>(), {
  active: true,
  pageHeader: true,
  statistic: 2,
  actionButton: true,
  toolbar: true,
  list: 5,
})
</script>

<template>
  <div style="width: 100%;">
    <PageHeaderSkeleton v-if="pageHeader !== false" :active="active" />
    <StatisticSkeleton
      v-if="statistic !== false"
      :size="typeof statistic === 'number' ? statistic : undefined"
      :active="active"
    />
    <Card
      v-if="toolbar !== false || list !== false"
      variant="borderless"
      :styles="{ body: { padding: 0 } }"
    >
      <ListToolbarSkeleton v-if="toolbar !== false" :active="active" />
      <ListSkeleton
        v-if="list !== false"
        :size="typeof list === 'number' ? list : 5"
        :active="active"
        :action-button="actionButton !== false"
      />
    </Card>
  </div>
</template>
