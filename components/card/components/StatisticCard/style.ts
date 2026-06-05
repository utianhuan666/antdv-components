import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

interface StatisticCardToken extends ProAliasToken {
  componentCls: string
}

const genStatisticCardStyle: GenerateStyle<StatisticCardToken> = token => ({
  [token.componentCls]: {
    '&-content': {
      'display': 'flex',
      'flexDirection': 'column',
      'gap': token.margin,
      '&-horizontal': {
        flexDirection: 'row',
        alignItems: 'center',
      },
    },
    '&-chart': {
      'flex': 1,
      'minWidth': 0,
      '&-left': {
        marginInlineEnd: token.margin,
      },
      '&-right': {
        marginInlineStart: token.margin,
      },
    },
    '&-footer': {
      marginBlockStart: token.margin,
      paddingBlockStart: token.paddingSM,
      color: token.colorTextSecondary,
      borderBlockStart: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
    },
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('StatisticCard', (token) => {
    const statisticCardToken: StatisticCardToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genStatisticCardStyle(statisticCardToken)]
  })
}
