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
        Table of Contents
      </div>
      <a-anchor
        :items="items"
        :offset-top="76"
        :target-offset="76"
        :affix="false"
      />
    </div>
  </aside>
</template>

<style scoped>
.site-toc {
  position: sticky;
  top: 100px;
  width: var(--site-toc-width);
  max-height: 80vh;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--ant-color-split) transparent;
}

.site-toc-inner {
  padding: 48px 24px 32px 0;
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

@media (max-width: 1200px) {
  .site-toc {
    display: none;
  }
}
</style>
