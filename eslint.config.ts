import antfu from '@antfu/eslint-config'

export default antfu({
  regexp: false,
  e18e: false,
  node: false,
  formatters: {
    css: true,
    html: true,
    prettierOptions: {
      singleQuote: true,
      tabWidth: 2,
      semi: false,
      printWidth: 120,
      trailingComma: 'all',
    },
  },
  rules: {
    'vue/valid-v-slot': 'off',
    'ts/no-empty-object-type': 'off',
  },
})
