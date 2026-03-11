<script setup lang="ts">
import type { Locale } from 'antdv-next/locale/index'
import dayjs from 'dayjs'
import { useTheme } from '@/components/config/theme'
import { useCopyCode } from '@/components/demo/copy-code'
import ConfigRegister from './register.vue'
import 'dayjs/locale/zh'
import 'dayjs/locale/en'

defineOptions({
  name: 'BaseConfig',
})
useCopyCode()
const { theme } = useTheme()
const { locale, messages } = useI18n()
const antdLocale = computed(() => {
  return (messages.value?.[locale.value]?.antd || undefined) as Locale | undefined
})

watch(
  locale,
  () => {
    // 切换dayjs的中英文
    if (locale.value === 'zh-CN') {
      dayjs.locale('zh')
    } else {
      dayjs.locale('en')
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <a-config-provider :locale="antdLocale" :theme="theme">
    <a-app>
      <ConfigRegister>
        <slot />
      </ConfigRegister>
    </a-app>
  </a-config-provider>
</template>
