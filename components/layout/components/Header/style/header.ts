import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import { useStyle as useAntdStyle } from '../../../../provider'

export interface HeaderToken extends ProAliasToken {
  componentCls: string
}

const genHeaderStyle: GenerateStyle<HeaderToken> = token => ({
  [token.componentCls]: {
    height: token.layout?.header?.heightLayoutHeader || 56,
    lineHeight: `${token.layout?.header?.heightLayoutHeader || 56}px`,
    background: 'transparent',
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutHeader', (token) => {
    const headerToken: HeaderToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genHeaderStyle(headerToken)]
  })
}
