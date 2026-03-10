<script setup lang="ts">
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteFeatures' })
</script>

<template>
  <section class="site-features">
    <div class="site-features-inner">
      <div class="site-features-grid">
        <div
          v-for="(feature, i) in siteConfig.features"
          :key="feature.title"
          class="site-feature-card"
          :style="{ '--card-index': i }"
        >
          <div class="site-feature-icon">
            {{ feature.icon }}
          </div>
          <h3 class="site-feature-title">
            {{ feature.title }}
          </h3>
          <p class="site-feature-desc">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.site-features {
  padding: 80px 24px;
  background: var(--ant-color-bg-container);
}

.site-features-inner {
  max-width: var(--site-content-max-width);
  margin: 0 auto;
}

.site-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.site-feature-card {
  position: relative;
  padding: 28px;
  border-radius: 16px;
  background: var(--ant-color-bg-layout);
  border: 1px solid var(--ant-color-split);
  transition:
    transform 0.25s,
    box-shadow 0.25s,
    border-color 0.25s;
  overflow: hidden;
}

.site-feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--site-gradient-1), var(--site-gradient-2));
  opacity: 0;
  transition: opacity 0.25s;
}

.site-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--ant-color-primary) 12%, transparent);
  border-color: var(--ant-color-primary-border);
}

.site-feature-card:hover::before {
  opacity: 1;
}

.site-feature-icon {
  margin-bottom: 16px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--ant-color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.site-feature-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text);
  line-height: 1.4;
}

.site-feature-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ant-color-text-secondary);
}
</style>
