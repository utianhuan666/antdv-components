<script setup lang="ts">
import SiteHeader from '@/components/site-header/index.vue'

defineOptions({ name: 'MainLayout' })
</script>

<template>
  <div class="main-layout">
    <SiteHeader />
    <div class="main-layout-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: var(--site-header-height);
}
</style>
