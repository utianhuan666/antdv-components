<script setup lang="ts">
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteHero' })
</script>

<template>
  <section class="site-hero">
    <!-- 背景渐变球 -->
    <div class="site-hero-blur-ball" aria-hidden="true" />

    <!-- 网格图案 -->
    <div class="site-hero-grid" aria-hidden="true" />

    <div class="site-hero-content">
      <h1 class="site-hero-title">
        <span class="site-hero-title-gradient">{{ siteConfig.hero.title }}</span>
        <br>
        <span class="site-hero-title-zh">{{ siteConfig.hero.titleZh }}</span>
      </h1>

      <p class="site-hero-description">
        {{ siteConfig.hero.description }}
      </p>

      <div class="site-hero-actions">
        <a
          v-for="btn in siteConfig.hero.buttons"
          :key="btn.label"
          :href="btn.link"
          :target="btn.link.startsWith('http') ? '_blank' : undefined"
          :rel="btn.link.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="site-hero-btn"
          :class="btn.type === 'primary' ? 'site-hero-btn-primary' : 'site-hero-btn-default'"
        >
          {{ btn.label }}
        </a>
      </div>

      <!-- 版本/生态徽章 -->
      <div class="site-hero-badges">
        <span class="site-hero-badge">Vue 3</span>
        <span class="site-hero-badge">TypeScript</span>
        <span class="site-hero-badge">Ant Design</span>
        <span class="site-hero-badge">UnoCSS</span>
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
  min-height: calc(100vh - var(--site-header-height));
  overflow: hidden;
  padding: 80px 24px;
  background: var(--ant-color-bg-layout);
}

/* 流动渐变背景球 */
.site-hero-blur-ball {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  max-width: 800px;
  max-height: 800px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  will-change: transform;
  background: linear-gradient(
    135deg,
    var(--site-gradient-3) 0%,
    var(--site-gradient-1) 30%,
    #ff4d4f 70%,
    var(--site-gradient-2) 100%
  );
  background-size: 300% 300%;
  animation: heroGlow 12s ease infinite;
  pointer-events: none;
}

.dark .site-hero-blur-ball {
  opacity: 0.25;
}

@keyframes heroGlow {
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

/* 网格背景 */
.site-hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--ant-color-split) 1px, transparent 1px),
    linear-gradient(90deg, var(--ant-color-split) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%);
  pointer-events: none;
}

.site-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 720px;
}

.site-hero-title {
  margin: 0 0 24px;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.site-hero-title-gradient {
  background: var(--site-hero-bg);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: heroFlow 6s ease infinite;
  will-change: background-position;
}

@keyframes heroFlow {
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

.site-hero-title-zh {
  color: var(--ant-color-text);
  font-size: 0.65em;
  font-weight: 600;
}

.site-hero-description {
  margin: 0 auto 40px;
  max-width: 560px;
  font-size: clamp(16px, 1.8vw, 20px);
  line-height: 1.7;
  color: var(--ant-color-text-secondary);
}

.site-hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.site-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 28px;
  border-radius: 22px;
  font-size: 15px;
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
  box-shadow: 0 4px 20px color-mix(in srgb, var(--site-gradient-1) 40%, transparent);
}

.site-hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px color-mix(in srgb, var(--site-gradient-1) 50%, transparent);
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
  transform: translateY(-2px);
}

.site-hero-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.site-hero-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: var(--ant-color-fill-tertiary);
  color: var(--ant-color-text-secondary);
  border: 1px solid var(--ant-color-border);
}
</style>
