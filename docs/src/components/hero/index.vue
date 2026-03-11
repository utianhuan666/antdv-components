<script setup lang="ts">
import type { HeroButton } from '@/config'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteHero' })

const internalButtons = computed(() =>
  (siteConfig.hero.buttons as HeroButton[]).filter((button) => !isExternalLink(button.link)),
)

const externalButtons = computed(() =>
  (siteConfig.hero.buttons as HeroButton[]).filter((button) => isExternalLink(button.link)),
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
  background: transparent;
  min-height: 400px;
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
  filter: blur(69px);
  will-change: transform;
  background: var(--site-hero-blur-bg);
  background-size: 200% 200%;
  animation: glow 10s ease infinite;
  pointer-events: none;
  z-index: 10;
}

@keyframes glow {
  0% {
    background-position: 0 -100%;
  }
  50% {
    background-position: 200% 50%;
  }
  100% {
    background-position: 0 -100%;
  }
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
  z-index: 10;
  margin: 0;
  font-size: 68px;
  font-weight: 800;
  line-height: var(--ant-line-height-heading1, 1.15);
  font-family: 'Alibaba PuHuiTi 2.0', 'Segoe UI', var(--ant-font-family), sans-serif;
}

.site-hero-title-shadow {
  position: absolute;
  inset: 0;
  font-size: 68px;
  font-weight: 800;
  line-height: var(--ant-line-height-heading1, 1.15);
  color: var(--ant-color-text-base);
  text-shadow: var(--site-hero-text-shadow);
  font-family: 'Alibaba PuHuiTi 2.0', 'Segoe UI', var(--ant-font-family), sans-serif;
  z-index: 0;
  will-change: transform;
}

.site-hero-title-shadow .site-hero-title-solid {
  color: transparent;
}

.site-hero-title-solid {
  display: inline-block;
  color: transparent;
  background-image: radial-gradient(at 80% 20%, #1677ff 0%, #13c2c2 80%, #722ed1 130%);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 5s ease infinite;
  position: relative;
  z-index: 5;
}

.site-hero-title-gradient {
  display: inline-block;
  background-image: radial-gradient(at 80% 20%, #1677ff 0%, #13c2c2 80%, #722ed1 130%);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 5s ease infinite;
  position: relative;
  z-index: 5;
}

@keyframes flow {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0 0;
  }
}

.site-hero-subtitle {
  margin: 28px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 20px;
  line-height: 1.6;
}

.site-hero-description {
  margin: 32px;
  font-size: 20px;
  line-height: 1.6;
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
  border-radius: 20px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
  text-decoration: none;
}

.site-hero-btn-primary {
  background: linear-gradient(90deg, #1677ff 0%, #13c2c2 100%);
  color: #fff;
  border: none;
}

.site-hero-btn-primary:hover {
  filter: brightness(1.1);
  color: #fff;
}

.site-hero-btn-default {
  background: transparent;
  color: var(--ant-color-text);
  border: 1px solid var(--ant-color-border);
}

.site-hero-btn-default:hover {
  border-color: var(--ant-color-primary);
  color: var(--ant-color-primary);
}

@media (max-width: 768px) {
  .site-hero {
    padding-top: 56px;
  }

  .site-hero-canvas {
    width: 200px;
    height: 300px;
  }

  .site-hero-title,
  .site-hero-title-shadow {
    font-size: 40px;
  }

  .site-hero-subtitle {
    margin-top: 24px;
    font-size: 16px;
  }

  .site-hero-description {
    margin-top: 20px;
    font-size: 16px;
  }

  .site-hero-actions {
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
