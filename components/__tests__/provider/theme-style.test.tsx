import { createCache, extractStyle, StyleProvider } from '@antdv-next/cssinjs'
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { genProStyleHooks } from '../../theme/genProStyleUtils'

async function extractThemeStyle() {
  const cache = createCache()
  const useProGridContentStyle = genProStyleHooks(
    'ProGridContent',
    token => ({
      [token.componentCls]: {
        width: token.wideMaxWidth,
        zIndex: token.zIndexPopupBase,
      },
    }),
    { wideMaxWidth: 1200 },
  )

  const Demo = defineComponent({
    setup() {
      const prefixCls = ref('ant-pro-grid-content')
      const [hashId, cssVarCls] = useProGridContentStyle(prefixCls)

      return () =>
        h('div', {
          'class': [
            prefixCls.value,
            hashId.value,
            cssVarCls.value,
          ],
          'data-css-var-cls': cssVarCls.value,
          'data-hash-id': hashId.value,
        }, 'grid')
    },
  })

  const app = createSSRApp({
    render: () =>
      h(ConfigProvider, { theme: { cssVar: { key: 'pro-theme-test' }, hashed: true } }, {
        default: () =>
          h(StyleProvider, { cache, layer: true, mock: 'server' }, {
            default: () => h(Demo),
          }),
      }),
  })

  const html = await renderToString(app)
  const styleText = extractStyle(cache, { plain: true })

  return { html, styleText }
}

describe('pro theme style utils', () => {
  it('registers css variables, layer and hash classes', async () => {
    const { html, styleText } = await extractThemeStyle()

    expect(html).toContain('pro-theme-test')
    expect(html).toContain('data-hash-id="css-dev-only-do-not-override')
    expect(styleText).toContain('@layer antd-pro')
    expect(styleText).toContain('.ant-pro-grid-content')
    expect(styleText).toContain('.pro-theme-test.ant-pro-grid-content{--ant-pro-grid-content-wide-max-width')
    expect(styleText).toContain('width:var(--ant-pro-grid-content-wide-max-width)')
    expect(styleText).toContain('--ant-z-index-popup-base:1000;')
    expect(styleText).toContain('z-index:var(--ant-z-index-popup-base)')
  })
})
