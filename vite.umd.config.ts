import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types'
import vueResolveTypes from 'vite-plugin-vue-resolve-types'

export default defineConfig({
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
      ],
      output: {
        globals: {
          'vue': 'Vue',
          'antdv-next': 'antd',
          '@antdv-next/icons': 'AntdIcons',
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
