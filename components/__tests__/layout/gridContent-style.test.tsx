import { createCache, extractStyle, StyleProvider } from '@antdv-next/cssinjs'
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { GridContent, RouteContextProvider } from '../../layout'

async function extractGridContentStyle() {
  const cache = createCache()
  const app = createSSRApp({
    render: () =>
      h(ConfigProvider, { theme: { cssVar: { key: 'grid-content-test' }, hashed: true } }, {
        default: () =>
          h(StyleProvider, { cache, layer: true, mock: 'server' }, {
            default: () =>
              h(RouteContextProvider, { value: { layout: 'top', contentWidth: 'Fixed' } }, {
                default: () => h(GridContent, null, { default: () => 'content' }),
              }),
          }),
      }),
  })

  const html = await renderToString(app)
  const styleText = extractStyle(cache, { plain: true, types: 'style' })

  return { html, styleText }
}

describe('gridContent theme style', () => {
  it('uses the pro theme hook css vars, hash and wide styles', async () => {
    const { html, styleText } = await extractGridContentStyle()

    expect(html).toContain('ant-pro-grid-content')
    expect(html).toContain('ant-pro-grid-content-wide')
    expect(html).toContain('grid-content-test')
    expect(styleText).toContain('@layer antd-pro')
    expect(styleText).toContain('.ant-pro-grid-content')
    expect(styleText).toContain('box-sizing:border-box')
    expect(styleText).toContain('width:100%')
    expect(styleText).toContain('width:min(100%, var(--pro-layout-content-fixed-max-width))')
    expect(styleText).toContain('margin-inline:auto')
    expect(styleText).toContain('.ant-pro-grid-content-children')
  })
})
