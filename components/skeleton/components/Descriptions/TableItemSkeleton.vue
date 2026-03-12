<script setup lang="ts">
import { Skeleton, useBreakpoint } from 'antdv-next'
import { computed } from 'vue'
import SkeletonLine from '../List/SkeletonLine.vue'

defineOptions({ name: 'TableItemSkeleton' })

const { active, header } = defineProps<{
  active?: boolean
  header?: boolean
}>()

const responsiveArray = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

const MediaQueryKeyEnum: Record<string, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  xxl: 3,
  xxxl: 4,
}

const screens = useBreakpoint()

const arraySize = computed(() => {
  const s = screens.value ?? {}
  const colSize = responsiveArray.find(key => s[key] === true) ?? 'md'
  return MediaQueryKeyEnum[colSize] ?? 3
})

const items = computed(() => Array.from({ length: arraySize.value }))
</script>

<template>
  <div>
    <div
      :style="{
        display: 'flex',
        background: header ? 'rgba(0,0,0,0.02)' : 'none',
        padding: '24px 8px',
      }"
    >
      <div
        v-for="(_, i) in items"
        :key="i"
        :style="{
          flex: 1,
          paddingInlineStart: header && i === 0 ? 0 : '20px',
          paddingInlineEnd: '32px',
        }"
      >
        <Skeleton
          :active="active"
          :paragraph="false"
          :title="{ width: header ? '75px' : '100%' }"
          :styles="{ title: { margin: 0, height: '24px' } }"
        />
      </div>
      <div style="flex: 3; padding-inline-start: 32px">
        <Skeleton
          :active="active"
          :paragraph="false"
          :title="{ width: header ? '75px' : '100%' }"
          :styles="{ title: { margin: 0, height: '24px' } }"
        />
      </div>
    </div>
    <SkeletonLine padding="0px 0px" />
  </div>
</template>
