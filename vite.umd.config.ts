import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types'
import vueResolveTypes from 'vite-plugin-vue-resolve-types'

export default defineConfig({
  base: './',
  plugins: [
    vueResolveTypes(),
    vue(),
    tsxResolveTypes({
      defaultPropsToUndefined: ['Boolean'],
    }),
    vueJsx(),
  ],
  build: {
    rolldownOptions: {
      external: [
        'vue',
        'antdv-next',
        '@antdv-next/icons',
        /^dayjs/,
      ],
      output: {
        globals: {
          'vue': 'Vue',
          'antdv-next': 'antd',
          '@antdv-next/icons': 'AntdIcons',
          'dayjs': 'dayjs',
          // plugins: 'dayjs_plugin',
          // like this
          // 'dayjs/plugin/advancedFormat': 'dayjs_plugin_advancedFormat',
        },
      },
    },
    emptyOutDir: false,
    lib: {
      entry: 'components/index.ts',
      formats: ['umd'],
      fileName: () => 'index.umd.js',
      name: 'AntdComponents',
    },
  },
})
