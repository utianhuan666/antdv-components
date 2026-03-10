<script setup lang="ts">
import BaseConfig from '@/components/config/base.vue'
import SiteHeader from '@/components/site-header/index.vue'
</script>

<template>
  <BaseConfig>
    <SiteHeader />
    <div class="app-body">
      <router-view />
    </div>
  </BaseConfig>
</template>

<style>
.app-body {
  padding-top: var(--site-header-height);
  min-height: calc(100vh - var(--site-header-height));
}
</style>
