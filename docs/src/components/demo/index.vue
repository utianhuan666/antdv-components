<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import { CheckOutlined, CopyOutlined } from '@antdv-next/icons'
import { useClipboard } from '@vueuse/core'
import demos from 'virtual:demos'
import { computed, defineAsyncComponent, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExpandIcon from './expand-icon.vue'

defineOptions({
  name: 'Demo',
})

const props = withDefaults(
  defineProps<{
    src: string
    compact?: boolean
    background?: string
    simplify?: boolean
  }>(),
  {
    compact: false,
    background: '',
    simplify: false,
  },
)

const route = useRoute()
const router = useRouter()
const showCode = shallowRef(false)
const codeType = shallowRef<'ts' | 'js'>('ts')
const demo = computed(() => demos[props.src])

const preferredLocale = computed(() => {
  return route.path.includes('/en') ? 'en-US' : 'zh-CN'
})

const description = computed(() => {
  const locales = demo.value?.locales ?? {}
  return (
    locales[preferredLocale.value]?.html ||
    locales['zh-CN']?.html ||
    locales['en-US']?.html ||
    Object.values(locales)[0]?.html ||
    ''
  )
})

const component = computed<Component | undefined>(() => {
  if (typeof demo.value?.component === 'function')
    return defineAsyncComponent(demo.value.component as () => Promise<Component>)
  return demo.value?.component as Component | undefined
})

const id = computed(() =>
  props.src
    .replace(/^\/+/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w-]+/g, '-'),
)
const hasJsSource = computed(() => Boolean(demo.value?.jsSource?.trim()))
const activeCodeType = computed<'ts' | 'js'>({
  get() {
    if (codeType.value === 'js' && hasJsSource.value) return 'js'
    return 'ts'
  },
  set(value) {
    codeType.value = value
  },
})
const sourceCode = computed(() => {
  if (activeCodeType.value === 'js') return demo.value?.jsSource || demo.value?.source || ''
  return demo.value?.source || ''
})
const sourceHtml = computed(() => {
  if (activeCodeType.value === 'js') return demo.value?.jsHtml || demo.value?.html || ''
  return demo.value?.html || ''
})

const { copied, copy } = useClipboard({
  source: sourceCode,
  legacy: true,
})

const isActive = computed(() => route.hash === `#${id.value}`)
const demoStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {}
  if (props.compact) {
    styles.padding = '0'
    styles.overflow = 'hidden'
  }
  if (props.background === 'grey') styles.backgroundColor = 'var(--ant-color-bg-layout)'
  return styles
})
const cls = computed(() => ({
  'border-primary': isActive.value,
  'ant-doc-demo-box-simplify': props.simplify,
}))

function toggleCode() {
  showCode.value = !showCode.value
}

function navigateToAnchor(event: MouseEvent) {
  event.preventDefault()
  router.push({
    path: route.path,
    hash: `#${id.value}`,
  })
}
</script>

<template>
  <section :id="id" class="ant-doc-demo-box border-solid border-color-split border-1px" :class="cls">
    <template v-if="simplify">
      <section class="vp-raw ant-doc-demo-box-demo" :style="demoStyle">
        <component :is="component" v-if="component" />
      </section>
    </template>
    <template v-else>
      <section class="vp-raw ant-doc-demo-box-demo" :style="demoStyle">
        <Suspense>
          <component :is="component" v-if="component" />
          <template #fallback>
            <a-skeleton active :paragraph="{ rows: 5 }" />
          </template>
        </Suspense>
      </section>

      <section class="ant-doc-demo-box-meta markdown">
        <div class="ant-doc-demo-box-title">
          <a :href="`#${id}`" @click="navigateToAnchor">
            <slot />
          </a>
        </div>
        <div v-if="description" class="ant-doc-demo-box-meta-description">
          <div v-html="description" />
        </div>
        <a-flex class="ant-doc-demo-box-actions" wrap gap="middle" justify="center">
          <a-tooltip :title="copied ? '已复制' : '复制代码'">
            <button class="ant-doc-demo-box-code-action" type="button" @click="copy()">
              <CheckOutlined v-if="copied" />
              <CopyOutlined v-else />
            </button>
          </a-tooltip>
          <a-tooltip :title="showCode ? '收起代码' : '展开代码'">
            <button class="ant-doc-demo-box-expand-icon ant-doc-demo-box-code-action" type="button" @click="toggleCode">
              <ExpandIcon :expanded="showCode" />
            </button>
          </a-tooltip>
        </a-flex>
      </section>

      <template v-if="showCode">
        <div v-if="hasJsSource" class="ant-doc-demo-box-code-tabs">
          <a-tabs v-model:active-key="activeCodeType" centered size="small">
            <a-tab-pane key="ts" tab="TypeScript" />
            <a-tab-pane key="js" tab="JavaScript" />
          </a-tabs>
        </div>
        <div class="ant-doc-demo-box-code">
          <a-tooltip :title="copied ? '已复制' : '复制代码'">
            <button
              class="ant-doc-demo-box-code-copy"
              :class="{ 'ant-doc-demo-box-code-copied': copied }"
              type="button"
              @click="copy()"
            >
              <CopyOutlined v-if="!copied" />
              <CheckOutlined v-else />
            </button>
          </a-tooltip>
          <div v-html="sourceHtml" />
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.ant-doc-demo-box {
  break-inside: avoid;
  display: flow-root;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.ant-doc-demo-box.border-primary {
  border-color: var(--ant-color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ant-color-primary) 12%, transparent);
}

.ant-doc-demo-box-demo {
  padding: 42px 24px 50px;
  border-bottom: 1px solid var(--ant-color-split);
  border-radius: 8px 8px 0 0;
  background: var(--ant-color-bg-container);
}

.ant-doc-demo-box-simplify {
  border: none;
  border-radius: 0;
  background: transparent;
}

.ant-doc-demo-box-simplify .ant-doc-demo-box-demo {
  padding: 0;
  border-bottom: 0;
  background: transparent;
}

.ant-doc-demo-box-meta.markdown {
  position: relative;
  width: 100%;
  font-size: 14px;
  border-radius: 0 0 6px 6px;
  transition: background-color 0.4s;
}

.ant-doc-demo-box-meta-description {
  padding: 18px 12px 24px;
}

.ant-doc-demo-box-meta-description :deep(p) {
  margin: 0;
}

.ant-doc-demo-box-title {
  position: absolute;
  top: -16px;
  margin-left: 16px;
  padding: 1px 8px;
  border-radius: 6px 6px 0 0;
  background-color: var(--ant-color-bg-container);
  transition: background-color 0.4s;
}

.ant-doc-demo-box-title a {
  color: var(--ant-color-text);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.ant-doc-demo-box-actions {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  border-top: 1px dashed var(--ant-color-split);
  opacity: 0.7;
  transition: opacity 0.3s;
}

.ant-doc-demo-box:hover .ant-doc-demo-box-actions {
  opacity: 1;
}

.ant-doc-demo-box-code-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition: color 0.24s ease;
}

.ant-doc-demo-box-code-action:hover {
  color: var(--ant-color-primary);
}

.ant-doc-demo-box-code {
  position: relative;
  line-height: 2;
  padding: var(--ant-padding-sm) var(--ant-padding);
}

.ant-doc-demo-box-code-tabs {
  border-top: 1px dashed var(--ant-color-split);
}

.ant-doc-demo-box-code-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.ant-doc-demo-box-code-tabs :deep(.ant-tabs-tab) {
  font-size: 12px;
}

.ant-doc-demo-box-code-copy {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ant-color-icon);
  cursor: pointer;
}

.ant-doc-demo-box-code-copied {
  color: var(--ant-color-success);
}

.ant-doc-demo-box-code :deep(.language-vue),
.ant-doc-demo-box-code :deep(.language-js),
.ant-doc-demo-box-code :deep(.language-ts) {
  margin: 0;
  border-radius: 0;
}

.ant-doc-demo-box-code :deep(pre) {
  margin: 0;
}
</style>
