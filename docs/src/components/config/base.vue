<script setup lang="ts">
import { useTheme } from '@/components/config/theme.ts'
import { useCopyCode } from '@/components/demo/copy-code.ts'
import ConfigRegister from './register.vue'

defineOptions({
  name: 'BaseConfig',
})
useCopyCode()
const { theme } = useTheme()
</script>

<template>
  <a-config-provider :theme="theme">
    <a-app>
      <ConfigRegister>
        <slot />
      </ConfigRegister>
    </a-app>
  </a-config-provider>
</template>
