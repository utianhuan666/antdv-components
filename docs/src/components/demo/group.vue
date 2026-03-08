<script setup lang="ts">
import type { VNode } from 'vue'
import { computed, onMounted, onUnmounted, ref, useSlots } from 'vue'
import { usePageInfo } from '@/composables/doc-page'

defineOptions({
  name: 'DemoGroup',
})

const props = defineProps<{
  cols?: number
}>()

const slots = useSlots()
const pageInfo = usePageInfo()
const containerRef = ref<HTMLElement>()
const containerWidth = ref(0)
const gap = 8
const minColumnWidth = 420
let resizeObserver: ResizeObserver | null = null

const configuredCols = computed(() => props.cols || pageInfo?.frontmatter?.demo?.cols || 1)
const actualCols = computed(() => {
  if (configuredCols.value <= 1)
    return 1
  if (containerWidth.value === 0)
    return configuredCols.value
  const maxPossibleCols = Math.floor((containerWidth.value + gap) / (minColumnWidth + gap))
  return Math.max(1, Math.min(configuredCols.value, maxPossibleCols))
})

const columns = computed(() => {
  const children = (slots.default?.() || []).filter((node) => {
    if (typeof node.children === 'string' && !node.children.trim())
      return false
    return node.type !== Comment
  }) as VNode[]

  if (actualCols.value <= 1)
    return [children]

  const result: VNode[][] = Array.from({ length: actualCols.value }, () => [])
  for (let i = 0; i < children.length; i++) {
    result[i % actualCols.value]!.push(children[i]!)
  }
  return result
})

function updateContainerWidth() {
  containerWidth.value = containerRef.value?.offsetWidth || 0
}

onMounted(() => {
  updateContainerWidth()
  if (containerRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateContainerWidth)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="containerRef"
    class="demo-group"
    :class="pageInfo?.frontmatter?.demo?.class"
    :style="{ '--demo-gap': `${gap}px` }"
  >
    <section v-for="(column, index) in columns" :key="index" class="demo-column">
      <component :is="() => column" />
    </section>
  </div>
</template>

<style scoped>
.demo-group {
  --demo-gap: 16px;

  display: flex;
  margin: calc(var(--demo-gap) * -1);
  margin-bottom: 24px;
}

.demo-column {
  flex: 1;
  min-width: 0;
  padding: var(--demo-gap);
}

.demo-column :deep(> *) {
  margin-bottom: calc(var(--demo-gap) * 2);
}

.demo-column :deep(> *:last-child) {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .demo-group {
    flex-direction: column;
  }
}
</style>
