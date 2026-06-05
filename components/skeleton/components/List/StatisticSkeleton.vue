<script setup lang="ts">
import { Card, Skeleton, SkeletonButton, useBreakpoint } from 'antdv-next'
import { computed } from 'vue'

defineOptions({ name: 'StatisticSkeleton' })

const props = defineProps<{
  size?: number
  active?: boolean
}>()

const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

const MediaQueryKeyEnum: Record<string, number> = {
  xs: 2,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 6,
  xxl: 6,
}

const screens = useBreakpoint()

const arraySize = computed(() => {
  if (props.size !== undefined)
    return props.size

  const colSize = responsiveArray.find(key => screens.value?.[key] === true) || 'md'

  return MediaQueryKeyEnum[colSize] || 6
})

const items = computed(() => Array.from({ length: arraySize.value }))

function firstWidth(index: number) {
  if (index === 0)
    return 0
  if (arraySize.value > 2)
    return 42
  return 16
}
</script>

<template>
  <Card
    variant="borderless"
    :style="{ marginBlockEnd: '16px' }"
  >
    <div style="width: 100%; justify-content: space-between; display: flex;">
      <div
        v-for="(_, index) in items"
        :key="index"
        :style="{
          borderInlineStart: arraySize > 2 && index === 1 ? '1px solid rgba(0,0,0,0.06)' : undefined,
          paddingInlineStart: `${firstWidth(index)}px`,
          flex: 1,
          marginInlineEnd: index === 0 ? '16px' : 0,
        }"
      >
        <Skeleton
          :active="active"
          :paragraph="false"
          :title="{ width: 100 }"
          :styles="{ title: { marginBlockStart: 0 } }"
        />
        <SkeletonButton
          :active="active"
          :style="{ height: '48px' }"
        />
      </div>
    </div>
  </Card>
</template>
