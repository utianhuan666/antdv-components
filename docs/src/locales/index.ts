import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

const i18n = createI18n({
  locale: 'zh-CN',
  legacy: false,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      zhCN,
    },
    'en-US': {
      ...enUS,
    },
  },
})

export { i18n }
