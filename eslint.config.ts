import antfu from '@antfu/eslint-config'

export default antfu({
  regexp: false,
  e18e: false,
  node: false,
  formatters: {
    css: true,
  },
  rules: {
    'vue/valid-v-slot': 'off',
  },
})
