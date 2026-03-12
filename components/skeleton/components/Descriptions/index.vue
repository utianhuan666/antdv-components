<script setup lang="ts">
import PageHeaderSkeleton from '../List/PageHeaderSkeleton.vue'
import SkeletonLine from '../List/SkeletonLine.vue'
import DescriptionsSkeleton from './DescriptionsSkeleton.vue'
import TableSkeleton from './TableSkeleton.vue'

defineOptions({ name: 'DescriptionsPageSkeleton' })

withDefaults(defineProps<{
  active?: boolean
  pageHeader?: false
  list?: number | false
}>(), {
  active: true,
})
</script>

<template>
  <div style="width: 100%;">
    <PageHeaderSkeleton v-if="pageHeader !== false" :active="active" />
    <DescriptionsSkeleton :active="active" />
    <template v-if="list !== false">
      <SkeletonLine />
      <TableSkeleton
        :active="active"
        :size="typeof list === 'number' ? list : undefined"
      />
    </template>
  </div>
</template>
