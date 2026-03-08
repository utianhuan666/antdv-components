import { fileURLToPath, URL } from 'node:url'
import { AntdvNextResolver } from '@antdv-next/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types'
import vueResolveTypes from 'vite-plugin-vue-resolve-types'
import { mdPlugin } from './plugins/markdown'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdPlugin(),
    vueResolveTypes(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    tsxResolveTypes({
      defaultPropsToUndefined: ['Boolean'],
    }),
    vueJsx(),
    unocss(),
    autoImport({
      dirs: [],
      dts: 'types/auto-imports.d.ts',
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
      ],
    }),
    components({
      dts: 'types/components.d.ts',
      dirs: [],
      resolvers: [
        AntdvNextResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 6878,
  },
})
