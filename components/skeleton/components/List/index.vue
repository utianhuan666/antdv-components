<script setup lang="ts">
import { Card } from 'antdv-next'
import ListSkeleton from './ListSkeleton.vue'
import ListToolbarSkeleton from './ListToolbarSkeleton.vue'
import PageHeaderSkeleton from './PageHeaderSkeleton.vue'
import StatisticSkeleton from './StatisticSkeleton.vue'

defineOptions({ name: 'ListPageSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  pageHeader?: false
  statistic?: number | false
  actionButton?: false
  toolbar?: false
  list?: number | false
}>(), {
  active: true,
  pageHeader: undefined,
  statistic: undefined,
  actionButton: undefined,
  toolbar: undefined,
  list: undefined,
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
        :action-button="actionButton"
      />
    </Card>
  </div>
</template>
