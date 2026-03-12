<script setup lang="ts">
import { Skeleton, useBreakpoint } from 'antdv-next'
import { computed } from 'vue'

defineOptions({ name: 'DescriptionsItemSkeleton' })

const props = withDefaults(defineProps<{
  size?: number
  active?: boolean
}>(), {
  active: true,
})

const responsiveArray = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const

const MediaQueryKeyEnum: Record<string, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  xxl: 4,
  xxxl: 4,
}

const screens = useBreakpoint()

const arraySize = computed(() => {
  if (props.size !== undefined) {
    return props.size
  }

  const s = screens.value ?? {}
  const colSize = responsiveArray.find(key => s[key] === true) ?? 'md'

  return MediaQueryKeyEnum[colSize] ?? 3
})

const items = computed(() => Array.from({ length: arraySize.value }))
</script>

<template>
  <div style="width: 100%; justify-content: space-between; display: flex;">
    <div
      v-for="(_, i) in items"
      :key="i"
      :style="{
        flex: 1,
        paddingInlineStart: i === 0 ? 0 : '24px',
        paddingInlineEnd: i === arraySize - 1 ? 0 : '24px',
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
