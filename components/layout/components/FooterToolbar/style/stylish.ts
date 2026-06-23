import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import { useStyle as useAntdStyle } from '../../../../provider'

export interface StylishToken extends ProAliasToken {
  componentCls: string
}

export function useStylish(
  prefixCls: string,
  {
    stylish,
  }: {
    stylish?: GenerateStyle<StylishToken>
  },
) {
  return useAntdStyle('ProLayoutFooterToolbarStylish', (token) => {
    const stylishToken: StylishToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    if (!stylish)
      return []

    return [
      {
        [`${stylishToken.componentCls}`]: stylish(stylishToken),
      },
    ]
  })
}
