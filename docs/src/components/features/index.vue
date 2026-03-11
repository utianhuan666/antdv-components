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
            gridRow: `span ${feature.row ?? 7}`,
            gridColumn: `span ${feature.column ?? 1}`,
            cursor: feature.link ? 'pointer' : 'default',
          }"
        >
          <div class="site-feature-card-inner">
            <div class="site-feature-icon-container" :data-role="feature.link ? 'link' : ''">
              <img
                v-if="
                  feature.icon &&
                  (feature.icon.startsWith('http') || feature.icon.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))
                "
                :src="feature.icon"
                :alt="feature.title"
                class="site-feature-icon-img"
              />
              <span v-else class="site-feature-icon-img">{{ feature.icon }}</span>
            </div>

            <h3 class="site-feature-title" :class="{ 'with-link': !!feature.link }">
              {{ feature.title }}
            </h3>

            <p class="site-feature-desc">
              {{ feature.description }}
            </p>

            <div v-if="feature.link" class="site-feature-link">
              <RouterLink v-if="!feature.openExternal" :to="feature.link"> 立即了解 → </RouterLink>
              <a v-else :href="feature.link" target="_blank" rel="noopener noreferrer"> 立即了解 → </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.site-features {
  width: 100%;
  padding: 0 16px;
  position: relative;
  z-index: 10;
}

.site-features-inner {
  max-width: var(--site-content-max-width, 1152px);
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
  z-index: 1;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--ant-color-fill-content), var(--ant-color-fill-quaternary));
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  overflow: hidden;
}

.site-feature-card-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.site-feature-card:hover {
  transform: scale(1.03);
  background: var(--site-feature-card-hover-bg);
  box-shadow:
    inset 0 0 0 1px var(--ant-color-border),
    var(--ant-box-shadow-secondary);
}

.site-feature-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: 8px;
  background: var(--site-icon-bg);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  margin-bottom: 0px;
}

.site-feature-icon-img {
  width: 20px;
  height: 20px;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18.33px;
}

.site-feature-title {
  margin: 16px 0;
  font-size: 20px;
  line-height: var(--ant-line-height-heading3, 1.33);
  color: var(--ant-color-text);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.site-feature-desc {
  margin: 0;
  color: var(--ant-color-text-secondary);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  line-height: var(--ant-line-height, 1.5714285714285714);
}

.site-feature-link {
  margin-top: 24px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.site-feature-link a {
  color: var(--ant-color-text-description, #8c8c8c);
  text-decoration: none;
}

.site-feature-link a:hover {
  color: var(--ant-color-primary-hover, #4096ff);
}

/* Hover effects */
.site-feature-card:hover .site-feature-icon-container {
  height: calc(20px * 7); /* 140px */
  width: 100%;
  padding: 0;
}

.site-feature-card:hover .site-feature-icon-img {
  width: 100px;
  height: 100px;
  font-size: 91.6px;
}

.site-feature-card:hover .site-feature-title.with-link {
  font-size: 14px;
}

.site-feature-card:hover .site-feature-desc {
  position: absolute;
  visibility: hidden;
  opacity: 0;
}

@media (max-width: 992px) {
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
