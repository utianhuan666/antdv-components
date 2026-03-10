<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import Toc from '@/components/toc/index.vue'
import { useDocPage } from '@/composables/doc-page'

defineOptions({ name: 'DocsLayout' })

const { pageData, anchorItems } = useDocPage()
</script>

<template>
  <div class="docs-layout">
    <Sidebar />

    <main class="docs-layout-main">
      <div class="docs-layout-content">
        <router-view />
      </div>
    </main>

    <Toc :items="anchorItems" />
  </div>
</template>

<style scoped>
.docs-layout {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - var(--site-header-height));
}

.docs-layout-main {
  flex: 1;
  min-width: 0;
  padding: 40px 48px;
}

.docs-layout-content {
  max-width: 860px;
  margin: 0 auto;
}

/* Markdown 内容排版增强 */
:deep(.markdown-body) {
  color: var(--ant-color-text);
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
}

:deep(h3) {
  margin-top: 32px;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

:deep(p) {
  margin: 0 0 16px;
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
  background: var(--ant-color-fill-tertiary);
  border-radius: 4px;
  border: 1px solid var(--ant-color-split);
}

:deep(pre code) {
  padding: 0;
  background: none;
  border: none;
}

/* Responsive */
@media (max-width: 1200px) {
  .docs-layout-main {
    padding: 32px 24px;
  }
}
</style>
