<script setup lang="ts">
import {
  GithubOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
  SunOutlined,
  TranslationOutlined,
} from '@antdv-next/icons'
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useDarkMode } from '@/composables/theme'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteHeader' })

const { isDark, toggleDark } = useDarkMode()
const { locale } = useI18n()
const route = useRoute()
const isMobile = useMediaQuery('(max-width: 960px)')
const mobileMenuOpen = ref(false)

const searchShortcut = computed(() => 'Ctrl K')

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

function toggleLocale() {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

function isNavActive(link?: string) {
  if (!link) {
    return false
  }

  if (link === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(link)
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner">
      <div class="site-header-left">
        <button
          v-if="isMobile"
          class="site-header-burger"
          type="button"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation"
          @click="toggleMobileMenu"
        >
          <span class="site-header-burger-icon" :class="{ 'is-active': mobileMenuOpen }">
            <MenuOutlined v-if="!mobileMenuOpen" />
            <span v-else class="site-header-burger-close">×</span>
          </span>
        </button>

        <RouterLink to="/" class="site-header-logo">
          <img src="@/assets/antdv-next.svg" class="site-header-logo-img" alt="logo" />
          <span class="site-header-logo-title">{{ siteConfig.title }}</span>
        </RouterLink>
      </div>

      <nav v-if="!isMobile" class="site-header-nav">
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

      <div class="site-header-actions">
        <button v-if="!isMobile" class="site-header-search" type="button">
          <SearchOutlined class="site-header-search-icon" />
          <span class="site-header-search-placeholder">Type keywords...</span>
          <span class="site-header-search-shortcut">{{ searchShortcut }}</span>
        </button>

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
          <a :href="siteConfig.github" target="_blank" rel="noopener noreferrer" class="site-header-action-btn">
            <GithubOutlined />
          </a>
        </a-tooltip>
      </div>
    </div>

    <transition name="site-header-mobile-panel">
      <div v-if="isMobile && mobileMenuOpen" class="site-header-mobile-panel">
        <nav class="site-header-mobile-nav">
          <RouterLink
            v-for="item in siteConfig.nav"
            :key="`mobile-${item.title}`"
            :to="item.link!"
            class="site-header-mobile-nav-item"
            :class="{ 'is-active': isNavActive(item.link) }"
          >
            {{ item.title }}
          </RouterLink>
        </nav>

        <button class="site-header-search site-header-search-mobile" type="button">
          <SearchOutlined class="site-header-search-icon" />
          <span class="site-header-search-placeholder">Type keywords...</span>
          <span class="site-header-search-shortcut">{{ searchShortcut }}</span>
        </button>
      </div>
    </transition>
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
  background-color: transparent;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-bottom: 1px solid var(--site-header-border);
  transition: background 0.3s;
}

.site-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  gap: 24px;
}

.site-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.site-header-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
}

.site-header-burger:hover {
  background: var(--ant-color-fill-tertiary);
  color: var(--ant-color-text);
}

.site-header-burger-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.site-header-burger-close {
  font-size: 22px;
  line-height: 1;
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
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.site-header-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 14px;
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
}

.site-header-nav-item.is-active {
  color: var(--ant-color-primary);
}

.site-header-nav-item.is-active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -20px;
  height: 2px;
  border-radius: 999px;
  background: var(--ant-color-primary);
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.site-header-search {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  min-width: 230px;
  padding: 0 12px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ant-color-bg-container) 92%, transparent);
  color: var(--ant-color-text-tertiary);
  cursor: pointer;
}

.site-header-search:hover {
  border-color: var(--ant-color-border);
  color: var(--ant-color-text-secondary);
}

.site-header-search-icon {
  font-size: 14px;
}

.site-header-search-placeholder {
  flex: 1;
  text-align: left;
  font-size: 13px;
}

.site-header-search-shortcut {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--ant-color-fill-tertiary);
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
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

.site-header-mobile-panel {
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  right: 0;
  padding: 16px;
  border-bottom: 1px solid var(--site-header-border);
  background: color-mix(in srgb, var(--site-header-bg) 96%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.site-header-mobile-nav {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.site-header-mobile-nav-item {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--ant-color-text-secondary);
  background: var(--ant-color-fill-quaternary);
}

.site-header-mobile-nav-item.is-active {
  color: var(--ant-color-primary);
  background: var(--ant-color-primary-bg);
}

.site-header-search-mobile {
  width: 100%;
}

.site-header-mobile-panel-enter-active,
.site-header-mobile-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.site-header-mobile-panel-enter-from,
.site-header-mobile-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 960px) {
  .site-header-inner {
    padding: 0 12px;
    gap: 12px;
  }

  .site-header-logo-title {
    font-size: 15px;
  }
}
</style>
