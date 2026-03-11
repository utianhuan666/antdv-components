<script setup lang="ts">
import { useRoute } from 'vue-router'
import BaseConfig from '@/components/config/base.vue'
import SiteHeader from '@/components/site-header/index.vue'

const route = useRoute()
</script>

<template>
  <BaseConfig>
    <SiteHeader />
    <div class="app-body" :class="{ 'is-home': route.name === 'home' }">
      <router-view />
    </div>
  </BaseConfig>
</template>

<style>
.app-body {
  padding-top: var(--site-header-height);
  min-height: calc(100vh - var(--site-header-height));
}

.app-body.is-home {
  padding-top: 0;
}
</style>
