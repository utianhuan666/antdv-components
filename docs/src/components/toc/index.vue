<script setup lang="ts">
import type { AnchorItem } from '@/composables/doc-page'

defineOptions({ name: 'SiteToc' })

defineProps<{
  items: AnchorItem[]
}>()
</script>

<template>
  <aside v-if="items.length" class="site-toc">
    <div class="site-toc-inner">
      <div class="site-toc-title">
        目录
      </div>
      <a-anchor
        :items="items"
        :offset-top="80"
        :target-offset="80"
        :affix="false"
      />
    </div>
  </aside>
</template>

<style scoped>
.site-toc {
  position: sticky;
  top: var(--site-header-height);
  width: var(--site-toc-width);
  height: calc(100vh - var(--site-header-height));
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--ant-color-split) transparent;
}

.site-toc-inner {
  padding: 24px 16px 32px;
}

.site-toc-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ant-color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Override antdv-next Anchor styles */
:deep(.ant-anchor) {
  font-size: 13px;
}

:deep(.ant-anchor-ink) {
  display: none;
}

:deep(.ant-anchor-link) {
  padding: 4px 0 4px 12px;
  line-height: 1.5;
}

:deep(.ant-anchor-link-title) {
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

:deep(.ant-anchor-link-title:hover) {
  color: var(--ant-color-text);
}

:deep(.ant-anchor-link-title-active) {
  color: var(--ant-color-primary) !important;
  font-weight: 500;
}
</style>
