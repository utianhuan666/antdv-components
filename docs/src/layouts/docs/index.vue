<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/sidebar/index.vue'
import SiteFooter from '@/components/site-footer/index.vue'
import Toc from '@/components/toc/index.vue'
import { useDocPage } from '@/composables/doc-page'

defineOptions({ name: 'DocsLayout' })

const { anchorItems, pageData } = useDocPage()

const route = useRoute()
const router = useRouter()

// 是否有 demo 内容（frontmatter.demo 存在时展示 tab）
const hasDemoTab = computed(() => !!pageData.value?.frontmatter?.demo)

// 当前激活 tab
const activeTab = computed(() => (route.query.tab === 'demo' ? 'demo' : 'doc'))

const tabItems = computed(() => {
  const locale = route.path.includes('-en') ? 'en-US' : 'zh-CN'
  const docLabel = locale === 'en-US' ? 'DOCS' : '文档'
  return [
    { key: 'doc', label: docLabel },
    { key: 'demo', label: 'DEMO' },
  ]
})

function onTabChange(key: string) {
  router.push({
    path: route.path,
    query: key === 'demo' ? { tab: 'demo' } : {},
  })
}
</script>

<template>
  <div class="docs-layout">
    <Sidebar class="docs-layout-sidebar" />

    <main class="docs-layout-main">
      <!-- 内容卡片：与 dumi-antd-style-content 对应 -->
      <div class="docs-content-card" :class="{ 'has-tabs': hasDemoTab }">
        <!-- Tab 在卡片内部顶部，使用 a-tabs 组件 -->
        <div v-if="hasDemoTab" class="docs-page-tabs" role="tablist">
          <button
            v-for="item in tabItems"
            :key="item.key"
            class="docs-page-tab"
            :class="{ 'is-active': activeTab === item.key }"
            type="button"
            role="tab"
            :aria-selected="activeTab === item.key"
            @click="onTabChange(item.key)"
          >
            {{ item.label }}
          </button>
        </div>

        <!-- 真正的文档内容 -->
        <div class="docs-content-inner">
          <router-view :key="route.path" />
        </div>
      </div>
    </main>

    <Toc class="docs-layout-toc" :items="anchorItems" />

    <SiteFooter class="docs-layout-footer" />
  </div>
</template>

<style scoped>
.docs-layout {
  display: grid;
  grid-template-columns: var(--site-sidebar-width) minmax(0, 1fr) minmax(0, var(--site-toc-width));
  grid-template-areas:
    'sidebar main toc'
    'sidebar footer footer';
  min-height: calc(100vh - var(--site-header-height));
  background-color: var(--ant-color-bg-layout);
  background-image: linear-gradient(180deg, var(--ant-color-bg-container) 0%, rgba(255, 255, 255, 0) 10%);
}

.docs-layout-sidebar {
  grid-area: sidebar;
}

.docs-layout-main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  grid-area: main;
  min-width: 0;
  padding: 24px;
  padding-bottom: 48px;
}

/* 内容卡片：与 ProComponents 的 dumi-antd-style-content 对应 */
.docs-content-card {
  width: 100%;
  max-width: var(--site-content-max-width, 960px);
  min-height: 400px;
  box-sizing: border-box;
  padding: 24px 48px;
  border-radius: 10px;
  background-color: var(--ant-color-bg-container);
  box-shadow: var(--ant-box-shadow-tertiary);
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

/* 有 Tab 时顶部 padding 缩小 */
.docs-content-card.has-tabs {
  padding-top: 0;
}

/* Tab 在卡片内的样式 */
.docs-page-tabs {
  display: flex;
  gap: 8px;
  padding-inline: 24px;
  border-bottom: 1px solid var(--ant-color-split);
}

/* Tab 文字样式 */
.docs-page-tab {
  padding: 16px 12px 14px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 14px;
  line-height: 1.5715;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition:
    background-color 150ms ease-out,
    border-color 0.2s,
    color 0.2s;
}

.docs-page-tab:hover {
  background: var(--ant-color-fill-tertiary);
  border-radius: 6px;
  color: var(--ant-color-text);
}

.docs-page-tab.is-active {
  border-bottom-color: var(--ant-color-primary);
  color: var(--ant-color-primary);
  font-weight: 600;
}

/* 内容区域 */
.docs-content-inner {
  padding-top: 24px;
}

.has-tabs .docs-content-inner {
  padding-top: 24px;
}

/* Markdown 排版 */
:deep(.markdown-body) {
  line-height: 1.75;
}

:deep(h1) {
  margin-top: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--ant-color-text);
}

:deep(h2) {
  margin-top: 40px;
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ant-color-split);
  color: var(--ant-color-text);
}

:deep(h3) {
  margin-top: 32px;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ant-color-text);
}

:deep(p) {
  margin: 0 0 16px;
  line-height: 1.8;
  color: var(--ant-color-text-secondary);
}

:deep(a) {
  color: var(--ant-color-primary);
}

:deep(a:hover) {
  color: var(--ant-color-primary-hover);
}

:deep(code) {
  padding: 2px 6px;
  font-size: 0.875em;
  color: var(--ant-color-primary-text);
  background: var(--ant-color-primary-bg);
  border-radius: 4px;
}

:deep(pre code) {
  padding: 0;
  background: none;
  color: inherit;
}

:deep(pre) {
  font-size: 14px;
  padding-left: 24px;
  padding-right: 24px;
}

:deep(table) {
  width: 100%;
  border-spacing: 1px;
}

:deep(th) {
  background: var(--ant-color-fill-tertiary);
}

:deep(th),
:deep(td) {
  padding: 10px 16px;
  border-bottom: 1px solid var(--ant-color-border-secondary);
}

:deep(blockquote) {
  margin: 16px 0;
  padding: 0 12px;
  font-style: italic;
  color: var(--ant-color-text-tertiary);
  border-left: 3px solid var(--ant-color-border);
}

:deep(ul li) {
  line-height: 1.8;
}

/* Responsive */
@media (max-width: 1200px) {
  .docs-layout {
    grid-template-columns: var(--site-sidebar-width) minmax(0, 1fr);
    grid-template-areas:
      'sidebar main'
      'sidebar footer';
  }
}

@media (max-width: 960px) {
  .docs-layout {
    display: block;
  }

  .docs-layout-main {
    padding: 16px;
    padding-bottom: 48px;
  }

  .docs-content-card {
    padding: 8px 16px;
    border-radius: 0;
  }
}
</style>
