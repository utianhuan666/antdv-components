<script setup lang="ts">
import SiteFooter from '@/components/site-footer/index.vue'
import Sidebar from '@/components/sidebar/index.vue'
import Toc from '@/components/toc/index.vue'
import { useDocPage } from '@/composables/doc-page'

defineOptions({ name: 'DocsLayout' })

const { anchorItems } = useDocPage()
</script>

<template>
  <div class="docs-layout">
    <Sidebar class="docs-layout-sidebar" />

    <main class="docs-layout-main">
      <div class="docs-layout-content">
        <router-view />
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
  background: var(--site-page-bg);
}

.docs-layout-sidebar {
  grid-area: sidebar;
}

.docs-layout-main {
  grid-area: main;
  min-width: 0;
  padding: 48px 0 64px;
}

.docs-layout-content {
  width: min(100% - 48px, 960px);
  max-width: var(--site-content-max-width);
  margin: 0 24px;
}

.docs-layout-toc {
  grid-area: toc;
}

.docs-layout-footer {
  grid-area: footer;
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
    padding: 32px 0 48px;
  }

  .docs-layout-content {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
}
</style>
