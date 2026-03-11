<script setup lang="ts">
import SiteFeatures from '@/components/features/index.vue'
import SiteHero from '@/components/hero/index.vue'
import SiteFooter from '@/components/site-footer/index.vue'

defineOptions({ name: 'HomePage' })
</script>

<template>
  <div class="home-page">
    <SiteHero />
    <SiteFeatures />
    <SiteFooter />
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  padding-bottom: 80px;
}

.home-page > * {
  width: 100%;
}
</style>
