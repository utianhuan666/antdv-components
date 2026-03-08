<script setup lang="ts">
import { useDocPage } from '@/composables/doc-page'

const { pageData, anchorItems } = useDocPage()
</script>

<template>
  <div>
    docs Layout
    {{ pageData }}
    {{ anchorItems }}
    <router-view />
  </div>
</template>
