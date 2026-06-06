import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

export interface TopNavHeaderToken extends ProAliasToken {
  componentCls: string
}

const genTopNavHeaderStyle: GenerateStyle<TopNavHeaderToken> = token => ({
  [token.componentCls]: {
    width: '100%',
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutTopNavHeader', (token) => {
    const topNavHeaderToken: TopNavHeaderToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genTopNavHeaderStyle(topNavHeaderToken)]
  })
}
