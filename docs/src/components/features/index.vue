<script setup lang="ts">
import type { FeatureItem } from '@/config'
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteFeatures' })

const featureItems = siteConfig.features as FeatureItem[]
</script>

<template>
  <section class="site-features">
    <div class="site-features-inner">
      <div class="site-features-grid">
        <div
          v-for="feature in featureItems"
          :key="feature.title"
          class="site-feature-card"
          :style="{
            gridRow: `span ${feature.row ?? 8}`,
            gridColumn: `span ${feature.column ?? 1}`,
            cursor: feature.link ? 'pointer' : 'default',
          }"
        >
          <div class="site-feature-card-inner">
            <div class="site-feature-icon">
              {{ feature.icon }}
            </div>
            <h3 class="site-feature-title">
              {{ feature.title }}
            </h3>
            <p class="site-feature-desc">
              {{ feature.description }}
            </p>

            <RouterLink v-if="feature.link && !feature.openExternal" :to="feature.link" class="site-feature-link">
              Learn more →
            </RouterLink>
            <a v-else-if="feature.link" :href="feature.link" target="_blank" rel="noopener noreferrer" class="site-feature-link">
              Learn more →
            </a>
          </div>
          <div class="site-feature-blur" aria-hidden="true" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.site-features {
  width: 100%;
  padding: 0 16px;
}

.site-features-inner {
  max-width: var(--site-content-max-width);
  margin: 0 auto;
}

.site-features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: row dense;
  grid-auto-rows: 24px;
  gap: 16px;
}

.site-feature-card {
  position: relative;
  padding: 24px;
  border-radius: 24px;
  background: var(--site-card-bg);
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    background 0.3s;
  overflow: hidden;
}

.site-feature-card-inner {
  position: relative;
  z-index: 1;
}

.site-feature-card:hover {
  transform: scale(1.03);
  box-shadow: inset 0 0 0 1px var(--ant-color-border), var(--ant-box-shadow-secondary);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--ant-color-fill-content) 82%, white),
    color-mix(in srgb, var(--ant-color-fill-quaternary) 82%, white)
  );
}

.site-feature-icon {
  margin-bottom: 16px;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: var(--ant-color-fill-content);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}

.site-feature-title {
  margin: 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ant-color-text);
  line-height: 1.45;
}

.site-feature-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ant-color-text-secondary);
}

.site-feature-link {
  display: inline-flex;
  align-items: center;
  margin-top: 24px;
  color: var(--ant-color-text-tertiary);
  transition: color 0.2s;
}

.site-feature-link:hover {
  color: var(--ant-color-primary);
}

.site-feature-blur {
  position: absolute;
  inset: 0;
  background: var(--site-hero-bg);
  opacity: 0.08;
  filter: blur(72px);
  transform: scale(2);
  pointer-events: none;
}

@media (max-width: 1200px) {
  .site-features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .site-features-grid {
    display: flex;
    flex-direction: column;
  }
}
</style>
