import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

interface StatisticToken extends ProAliasToken {
  componentCls: string
}

const genStatisticStyle: GenerateStyle<StatisticToken> = token => ({
  [token.componentCls]: {
    '&-vertical': {
      [`${token.antCls}-statistic-title`]: {
        marginBlockEnd: token.marginXXS,
      },
    },
    '&-description': {
      marginBlockStart: token.marginXXS,
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
    },
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProStatistic', (token) => {
    const statisticToken: StatisticToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genStatisticStyle(statisticToken)]
  })
}
