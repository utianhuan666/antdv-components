import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { globSync } from 'tinyglobby'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import { tsxResolveTypes } from 'vite-plugin-tsx-resolve-types'
import vueResolveTypes from 'vite-plugin-vue-resolve-types'

const files = globSync([
  './components/**/*.ts',
  './components/**/*.tsx',
  './components/**/*.vue',
]).map(file => `./${file}`)

export default defineConfig({
  plugins: [
    vueResolveTypes(),
    vue(),
    tsxResolveTypes({
      defaultPropsToUndefined: ['Boolean'],
    }),
    vueJsx(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'components',
    }),
  ],
  build: {
    rolldownOptions: {
      external: [
        'vue',
        'antdv-next',
        '@antdv-next/icons',
        '@vueuse/core',
      ],
    },
    lib: {
      entry: files,
      formats: ['es'],
    },
  },
})
