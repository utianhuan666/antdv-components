<script setup lang="ts">
import { App, theme } from 'antdv-next'
import { useApp } from '@/composables/app'
import { useGlobalToken } from '@/composables/token'

defineOptions({
  name: 'ConfigRegister',
})
const { token } = theme.useToken()
const globalToken = useGlobalToken()
watchEffect(() => {
  globalToken.token.value = token.value
})
const { notification, message, modal } = App.useApp()
const { registerApp } = useApp()
registerApp({
  notification,
  message,
  modal,
})
</script>

<template>
  <slot />
</template>
>
