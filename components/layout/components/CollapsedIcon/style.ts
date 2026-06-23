import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

export interface CollapsedIconToken extends ProAliasToken {
  componentCls: string
}

const genCollapsedIconStyle: GenerateStyle<CollapsedIconToken> = token => ({
  [token.componentCls]: {
    cursor: 'pointer',
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutCollapsedIcon', (token) => {
    const collapsedIconToken: CollapsedIconToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genCollapsedIconStyle(collapsedIconToken)]
  })
}
