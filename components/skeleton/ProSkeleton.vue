<script setup lang="ts">
import DescriptionsPageSkeleton from './components/Descriptions/index.vue'
import ListPageSkeleton from './components/List/index.vue'
import ResultPageSkeleton from './components/Result/index.vue'

defineOptions({ name: 'ProSkeleton' })

withDefaults(defineProps<{
  type?: 'list' | 'result' | 'descriptions'
  active?: boolean
  pageHeader?: false
  statistic?: number | false
  actionButton?: false
  toolbar?: false
  list?: number | false
}>(), {
  type: 'list',
  active: true,
  pageHeader: undefined,
  statistic: undefined,
  actionButton: undefined,
  toolbar: undefined,
  list: undefined,
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
