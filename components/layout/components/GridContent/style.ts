import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

interface ProGridContentToken extends ProAliasToken {
  componentCls: string
}

const contentFixedMaxWidth = '--pro-layout-content-fixed-max-width'

const genGridContentStyle: GenerateStyle<ProGridContentToken> = (token) => {
  return {
    [token.componentCls]: {
      'boxSizing': 'border-box',
      'width': '100%',
      '&-wide': {
        width: `min(100%, var(${contentFixedMaxWidth}))`,
        marginInline: 'auto',
      },
      [`${token.componentCls}-children`]: {
        boxSizing: 'border-box',
        width: '100%',
      },
    },
  }
}

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProGridContent', (token) => {
    const gridContentToken: ProGridContentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }

    return [genGridContentStyle(gridContentToken)]
  })
}
