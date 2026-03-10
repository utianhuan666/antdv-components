<script setup lang="ts">
import { GithubOutlined, MoonOutlined, SunOutlined, TranslationOutlined } from '@antdv-next/icons'
import { useDarkMode } from '@/composables/theme'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteHeader' })

const { isDark, toggleDark } = useDarkMode()
const { locale } = useI18n()
const route = useRoute()

function toggleLocale() {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

function isNavActive(link: string) {
  return route.path.startsWith(link)
}
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner">
      <!-- Logo -->
      <RouterLink to="/" class="site-header-logo">
        <img src="@/assets/antdv-next.svg" class="site-header-logo-img" alt="logo">
        <span class="site-header-logo-title">{{ siteConfig.title }}</span>
      </RouterLink>

      <!-- Nav Links -->
      <nav class="site-header-nav">
        <RouterLink
          v-for="item in siteConfig.nav"
          :key="item.title"
          :to="item.link!"
          class="site-header-nav-item"
          :class="{ 'is-active': isNavActive(item.link!) }"
        >
          {{ item.title }}
        </RouterLink>
      </nav>

      <!-- Actions -->
      <div class="site-header-actions">
        <a-tooltip :title="locale === 'zh-CN' ? 'English' : '中文'">
          <button class="site-header-action-btn" type="button" @click="toggleLocale">
            <TranslationOutlined />
          </button>
        </a-tooltip>

        <a-tooltip :title="isDark ? '切换亮色' : '切换暗色'">
          <button class="site-header-action-btn" type="button" @click="toggleDark()">
            <MoonOutlined v-if="isDark" />
            <SunOutlined v-else />
          </button>
        </a-tooltip>

        <a-tooltip title="GitHub">
          <a
            :href="siteConfig.github"
            target="_blank"
            rel="noopener noreferrer"
            class="site-header-action-btn"
          >
            <GithubOutlined />
          </a>
        </a-tooltip>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--site-header-height);
  background: var(--site-header-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--ant-color-split);
  transition: background 0.3s;
}

.site-header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: calc(var(--site-content-max-width) + var(--site-sidebar-width) + var(--site-toc-width) + 96px);
  margin: 0 auto;
  padding: 0 24px;
  gap: 24px;
}

.site-header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  color: var(--ant-color-text);
  font-weight: 600;
  font-size: 16px;
  transition: opacity 0.2s;
}

.site-header-logo:hover {
  opacity: 0.8;
  color: var(--ant-color-text);
}

.site-header-logo-img {
  width: 32px;
  height: 32px;
}

.site-header-logo-title {
  white-space: nowrap;
}

.site-header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.site-header-nav-item {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ant-color-text-secondary);
  transition:
    color 0.2s,
    background-color 0.2s;
  white-space: nowrap;
}

.site-header-nav-item:hover {
  color: var(--ant-color-text);
  background: var(--ant-color-bg-text-hover);
}

.site-header-nav-item.is-active {
  color: var(--ant-color-primary);
  background: var(--ant-color-primary-bg);
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.site-header-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ant-color-text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.site-header-action-btn:hover {
  color: var(--ant-color-text);
  background: var(--ant-color-bg-text-hover);
}
</style>
