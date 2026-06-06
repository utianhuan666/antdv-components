import type { GenerateStyle, ProAliasToken } from '../../provider'
import { useStyle as useAntdStyle } from '../../provider'

export const proLayoutVar = {
  contentFixedMaxWidth: '--pro-layout-content-fixed-max-width',
  headerHeight: '--pro-layout-header-height',
  fixedHeaderStart: '--pro-layout-fixed-header-start',
} as const

export interface ProLayoutToken extends ProAliasToken {
  componentCls: string
}

const genProLayoutStyle: GenerateStyle<ProLayoutToken> = token => ({
  [token.componentCls]: {
    [proLayoutVar.contentFixedMaxWidth]: '1152px',
    [proLayoutVar.headerHeight]: `${token.layout?.header?.heightLayoutHeader || 56}px`,
    'boxSizing': 'border-box',
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    [`${token.componentCls}-container`]: {
      width: '100%',
      minWidth: 0,
    },
    [`${token.componentCls}-bg-list`]: {
      pointerEvents: 'none',
      position: 'fixed',
      insetBlockStart: 0,
      insetInlineStart: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    [`&${token.componentCls}-fixed-header ${token.componentCls}-container`]: {
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayout', (token) => {
    const proLayoutToken: ProLayoutToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genProLayoutStyle(proLayoutToken)]
  })
}
