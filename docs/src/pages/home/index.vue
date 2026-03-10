<script setup lang="ts">
import SiteFeatures from '@/components/features/index.vue'
import SiteFooter from '@/components/site-footer/index.vue'
import SiteHero from '@/components/hero/index.vue'

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
}
</style>
