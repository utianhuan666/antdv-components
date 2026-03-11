import type { ConfigProviderProps } from 'antdv-next'
import { theme as themeConfig } from 'antdv-next'
import { useDarkMode } from '@/composables/theme'

export function useTheme() {
  const { isDark } = useDarkMode()
  const theme = shallowRef<NonNullable<ConfigProviderProps['theme']>>({
    cssVar: { prefix: 'ant' },
  })
  watch(
    isDark,
    () => {
      if (isDark.value) {
        theme.value = {
          algorithm: [themeConfig.darkAlgorithm],
          cssVar: { prefix: 'ant' },
        }
      } else {
        theme.value = {
          cssVar: { prefix: 'ant' },
        }
      }
    },
    {
      immediate: true,
    },
  )
  return {
    theme,
  }
}
