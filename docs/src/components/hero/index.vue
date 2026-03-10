<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { HeroButton } from '@/config'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteHero' })

const internalButtons = computed(() =>
  (siteConfig.hero.buttons as HeroButton[]).filter(button => !isExternalLink(button.link)),
)

const externalButtons = computed(() =>
  (siteConfig.hero.buttons as HeroButton[]).filter(button => isExternalLink(button.link)),
)

function isExternalLink(link: string) {
  return /^(https?:)?\/\//i.test(link)
}
</script>

<template>
  <section class="site-hero">
    <div class="site-hero-canvas" aria-hidden="true" />

    <div class="site-hero-content">
      <div class="site-hero-title-wrap">
        <h1 class="site-hero-title">
          <span class="site-hero-title-solid">{{ siteConfig.hero.title }}</span>
          <span class="site-hero-title-gradient">{{ siteConfig.hero.highlight }}</span>
        </h1>

        <div class="site-hero-title-shadow" aria-hidden="true">
          <span class="site-hero-title-solid">{{ siteConfig.hero.title }}</span>
          <span class="site-hero-title-gradient">{{ siteConfig.hero.highlight }}</span>
        </div>
      </div>

      <p v-if="siteConfig.hero.titleZh" class="site-hero-subtitle">
        {{ siteConfig.hero.titleZh }}
      </p>

      <p class="site-hero-description">
        {{ siteConfig.hero.description }}
      </p>

      <div class="site-hero-actions">
        <RouterLink
          v-for="btn in internalButtons"
          :key="btn.label"
          :to="btn.link"
          class="site-hero-btn"
          :class="btn.type === 'primary' ? 'site-hero-btn-primary' : 'site-hero-btn-default'"
        >
          {{ btn.label }}
        </RouterLink>

        <a
          v-for="btn in externalButtons"
          :key="`${btn.label}-external`"
          :href="btn.link"
          target="_blank"
          rel="noopener noreferrer"
          class="site-hero-btn"
          :class="btn.type === 'primary' ? 'site-hero-btn-primary' : 'site-hero-btn-default'"
        >
          {{ btn.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.site-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  padding: 72px 16px 0;
  background: var(--site-page-bg);
}

.site-hero-canvas {
  position: absolute;
  top: -250px;
  left: 50%;
  width: 600px;
  height: 400px;
  border-radius: 50%;
  transform: translateX(-50%) scale(1.5);
  opacity: 0.2;
  background: var(--site-hero-bg);
  filter: blur(72px);
  pointer-events: none;
}

.site-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 960px;
}

.site-hero-title-wrap {
  position: relative;
}

.site-hero-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(40px, 7vw, 68px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-family: 'Alibaba PuHuiTi 2.0', 'Segoe UI', var(--ant-font-family), sans-serif;
}

.site-hero-title-shadow {
  position: absolute;
  inset: 0;
  font-size: clamp(40px, 7vw, 68px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: transparent;
  text-shadow: 0 0 24px var(--site-hero-shadow), 0 12px 72px var(--site-hero-shadow);
  filter: blur(0.2px);
  font-family: 'Alibaba PuHuiTi 2.0', 'Segoe UI', var(--ant-font-family), sans-serif;
}

.site-hero-title-solid,
.site-hero-title-gradient {
  display: inline-block;
}

.site-hero-title-solid {
  color: var(--ant-color-text);
}

.site-hero-title-gradient {
  margin-left: 0.18em;
  background: var(--site-hero-bg);
  background-size: 120% 120%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-hero-subtitle {
  margin: 28px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: clamp(20px, 2.2vw, 24px);
}

.site-hero-description {
  margin: 28px auto 0;
  max-width: 760px;
  font-size: clamp(16px, 1.9vw, 20px);
  line-height: 1.7;
  color: var(--ant-color-text-secondary);
}

.site-hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 48px;
}

.site-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 28px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
  text-decoration: none;
}

.site-hero-btn-primary {
  background: linear-gradient(90deg, var(--site-gradient-1) 0%, var(--site-gradient-2) 100%);
  color: #fff;
  border: none;
  box-shadow: 0 8px 30px color-mix(in srgb, var(--site-gradient-1) 34%, transparent);
}

.site-hero-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--site-gradient-1) 40%, transparent);
  color: #fff;
}

.site-hero-btn-default {
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
  border: 1px solid var(--ant-color-border);
}

.site-hero-btn-default:hover {
  border-color: var(--ant-color-primary);
  color: var(--ant-color-primary);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .site-hero {
    padding-top: 56px;
  }

  .site-hero-canvas {
    width: 220px;
    height: 300px;
  }

  .site-hero-title-gradient {
    margin-left: 0;
    display: block;
  }

  .site-hero-subtitle {
    margin-top: 24px;
    font-size: 18px;
  }

  .site-hero-description {
    margin-top: 20px;
  }

  .site-hero-actions {
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
