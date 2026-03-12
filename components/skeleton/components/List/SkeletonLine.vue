<script setup lang="ts">
import { Divider } from 'antdv-next'

withDefaults(defineProps<{
  padding?: string | number
}>(), {
  padding: '0 24px',
})
</script>

<template>
  <div :style="{ padding }">
    <Divider :style="{ margin: 0 }" />
  </div>
</template>
