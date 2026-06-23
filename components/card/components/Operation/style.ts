import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

export interface ProToken extends ProAliasToken {
  componentCls: string
}

const genProStyle: GenerateStyle<ProToken> = token => ({
  [token.componentCls]: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBlock: token.marginLG,
    marginInline: 0,
    color: token.colorText,
    fontWeight: token.fontWeightStrong,
    fontSize: token.fontSizeHeading4,
    lineHeight: token.lineHeightHeading4,
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProCardOperation', (token) => {
    const proToken: ProToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }

    return [genProStyle(proToken)]
  })
}
