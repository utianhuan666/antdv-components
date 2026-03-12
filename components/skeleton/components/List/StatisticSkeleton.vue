<script setup lang="ts">
import { Card, Skeleton, useBreakpoint } from 'antdv-next'
import { computed } from 'vue'

defineOptions({ name: 'StatisticSkeleton' })

const props = withDefaults(defineProps<{
  size?: number
  active?: boolean
}>(), {
  active: true,
})

const responsiveArray = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

const MediaQueryKeyEnum: Record<string, number> = {
  xs: 2,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 6,
  xxl: 6,
  xxxl: 6,
}

const screens = useBreakpoint()

const arraySize = computed(() => {
  if (props.size !== undefined) {
    return props.size
  }

  const s = screens.value ?? {}
  const colSize = responsiveArray.find(key => s[key] === true) ?? 'md'

  return MediaQueryKeyEnum[colSize] ?? 6
})

const items = computed(() => Array.from({ length: arraySize.value }))

function firstWidth(index: number) {
  if (index === 0) {
    return 0
  }
  if (arraySize.value > 2) {
    return 42
  }
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
        v-for="(_, i) in items"
        :key="i"
        :style="{
          borderInlineStart: arraySize > 2 && i === 1 ? '1px solid rgba(0,0,0,0.06)' : undefined,
          paddingInlineStart: `${firstWidth(i)}px`,
          flex: 1,
          marginInlineEnd: i === 0 ? '16px' : 0,
        }"
      >
        <Skeleton
          :active="active"
          :paragraph="false"
          :title="{ width: 100 }"
          :styles="{ title: { marginBlockStart: 0 } }"
        />
        <Skeleton.Button
          :active="active"
          :style="{ height: '48px' }"
        />
      </div>
    </div>
  </Card>
</template>
