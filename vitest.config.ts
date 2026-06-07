import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './docs/vite.config'

const dayjsPlugin = (name: string) => fileURLToPath(new URL(`./node_modules/dayjs/plugin/${name}.js`, import.meta.url))

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'dayjs/plugin/advancedFormat': dayjsPlugin('advancedFormat'),
        'dayjs/plugin/customParseFormat': dayjsPlugin('customParseFormat'),
        'dayjs/plugin/localeData': dayjsPlugin('localeData'),
        'dayjs/plugin/weekday': dayjsPlugin('weekday'),
        'dayjs/plugin/weekOfYear': dayjsPlugin('weekOfYear'),
        'dayjs/plugin/weekYear': dayjsPlugin('weekYear'),
      },
    },
    test: {
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          url: 'http://localhost/',
        },
      },
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./components/__tests__/setupTests.ts'],
      server: {
        deps: {
          inline: true,
        },
      },
    },
  }),
)
