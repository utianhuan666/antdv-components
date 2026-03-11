<script setup lang="ts">
import type { SidebarGroup } from '@/config'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteSidebar' })

const route = useRoute()

const groups = computed<SidebarGroup[]>(() => {
  // 匹配最长前缀的 sidebar 配置
  const paths = Object.keys(siteConfig.sidebar).sort((a, b) => b.length - a.length)
  const matched = paths.find((p) => route.path.startsWith(p))
  return matched ? (siteConfig.sidebar[matched] ?? []) : []
})

function isActive(link: string) {
  // zh-CN 默认路由不带后缀，en-US 带 -en
  return route.path === link || route.path === `${link}-en`
}
</script>

<template>
  <aside class="site-sidebar">
    <div class="site-sidebar-inner">
      <div v-for="group in groups" :key="group.title" class="site-sidebar-group">
        <div class="site-sidebar-group-title">
          {{ group.title }}
        </div>
        <ul class="site-sidebar-list">
          <li v-for="item in group.items" :key="item.link">
            <RouterLink :to="item.link" class="site-sidebar-item" :class="{ 'is-active': isActive(item.link) }">
              {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.site-sidebar {
  position: sticky;
  top: calc(var(--site-header-height) + 1px);
  width: var(--site-sidebar-width);
  height: calc(100vh - var(--site-header-height));
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--ant-color-split);
  background: var(--ant-color-bg-layout);
  scrollbar-width: thin;
  scrollbar-color: var(--ant-color-split) transparent;
}

.site-sidebar::-webkit-scrollbar {
  width: 4px;
}

.site-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.site-sidebar::-webkit-scrollbar-thumb {
  background: var(--ant-color-split);
  border-radius: 4px;
}

.site-sidebar-inner {
  padding: 16px 0 32px;
}

.site-sidebar-group {
  margin-bottom: 8px;
}

.site-sidebar-group-title {
  padding: 16px 20px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ant-color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.site-sidebar-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-sidebar-item {
  display: block;
  padding: 7px 20px;
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  border-radius: 0;
  transition:
    color 0.2s,
    background-color 0.2s;
  line-height: 1.5;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.site-sidebar-item:hover {
  color: var(--ant-color-text);
  background: var(--ant-color-bg-text-hover);
}

.site-sidebar-item.is-active {
  color: var(--ant-color-primary);
  font-weight: 500;
  background: var(--ant-color-primary-bg);
}

.site-sidebar-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: var(--ant-color-primary);
  border-radius: 0 2px 2px 0;
}

@media (max-width: 960px) {
  .site-sidebar {
    display: none;
  }
}
</style>
