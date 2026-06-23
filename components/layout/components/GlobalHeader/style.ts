import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

export interface GlobalHeaderToken extends ProAliasToken {
  componentCls: string
}

const genGlobalHeaderStyle: GenerateStyle<GlobalHeaderToken> = token => ({
  [token.componentCls]: {
    display: 'flex',
    alignItems: 'center',
    height: token.layout?.header?.heightLayoutHeader || 56,
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutGlobalHeader', (token) => {
    const globalHeaderToken: GlobalHeaderToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genGlobalHeaderStyle(globalHeaderToken)]
  })
}
