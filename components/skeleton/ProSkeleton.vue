<script setup lang="ts">
import DescriptionsPageSkeleton from './components/Descriptions/index.vue'
import ListPageSkeleton from './components/List/index.vue'
import ResultPageSkeleton from './components/Result/index.vue'

defineOptions({ name: 'ProSkeleton' })

withDefaults(defineProps<{
  type?: 'list' | 'result' | 'descriptions'
  active?: boolean
  pageHeader?: boolean
  statistic?: number | false
  actionButton?: boolean
  toolbar?: boolean
  list?: number | false
}>(), {
  type: 'list',
  active: true,
  pageHeader: true,
  statistic: 2,
  actionButton: true,
  toolbar: true,
  list: 5,
})
</script>

<template>
  <ResultPageSkeleton
    v-if="type === 'result'"
    :active="active"
    :page-header="pageHeader"
  />
  <DescriptionsPageSkeleton
    v-else-if="type === 'descriptions'"
    :active="active"
    :page-header="pageHeader"
    :list="list"
  />
  <ListPageSkeleton
    v-else
    :active="active"
    :page-header="pageHeader"
    :statistic="statistic"
    :action-button="actionButton"
    :toolbar="toolbar"
    :list="list"
  />
</template>
