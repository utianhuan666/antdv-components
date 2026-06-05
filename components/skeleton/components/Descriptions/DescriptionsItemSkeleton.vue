<script setup lang="ts">
import { Skeleton, useBreakpoint } from 'antdv-next'
import { computed } from 'vue'

defineOptions({ name: 'DescriptionsItemSkeleton' })

const props = defineProps<{
  size?: number
  active?: boolean
}>()

const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

const MediaQueryKeyEnum: Record<string, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  xxl: 4,
}

const screens = useBreakpoint()

const arraySize = computed(() => {
  if (props.size !== undefined)
    return props.size

  const colSize = responsiveArray.find(key => screens.value?.[key] === true) || 'md'

  return MediaQueryKeyEnum[colSize] || 3
})

const items = computed(() => Array.from({ length: arraySize.value }))
</script>

<template>
  <div style="width: 100%; justify-content: space-between; display: flex;">
    <div
      v-for="(_, index) in items"
      :key="index"
      :style="{
        flex: 1,
        paddingInlineStart: index === 0 ? 0 : '24px',
        paddingInlineEnd: index === arraySize - 1 ? 0 : '24px',
      }"
    >
      <Skeleton
        :active="active"
        :paragraph="false"
        :styles="{ title: { marginBlockStart: 0 } }"
      />
      <Skeleton
        :active="active"
        :paragraph="false"
        :styles="{ title: { marginBlockStart: '8px' } }"
      />
      <Skeleton
        :active="active"
        :paragraph="false"
        :styles="{ title: { marginBlockStart: '8px' } }"
      />
    </div>
  </div>
</template>
