import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

interface ProCardActionsToken extends ProAliasToken {
  componentCls: string
  cardActionIconSize: number
}

const genActionsStyle: GenerateStyle<ProCardActionsToken> = (token) => {
  const { componentCls } = token
  return {
    [`${componentCls}-actions`]: {
      'boxSizing': 'border-box',
      'marginBlock': 0,
      'marginInline': 0,
      'paddingBlock': 0,
      'paddingInline': 0,
      'listStyle': 'none',
      'display': 'flex',
      'gap': token.marginXS,
      'background': token.colorBgContainer,
      'borderBlockStart': `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
      'minHeight': 42,
      '& > *': {
        'alignItems': 'center',
        'justifyContent': 'center',
        'flex': 1,
        'display': 'flex',
        'cursor': 'pointer',
        'color': token.colorTextSecondary,
        'transition': `color ${token.motionDurationMid}`,
        '&:hover': {
          color: token.colorPrimaryHover,
        },
      },
      '& > li > span': {
        flex: 1,
        width: '100%',
        marginBlock: token.marginSM,
        marginInline: 0,
        color: token.colorTextSecondary,
        textAlign: 'center',
      },
    },
  }
}

export default function useStyle(prefixCls?: string) {
  return useAntdStyle('ProCardActions', (token) => {
    const proCardActionsToken: ProCardActionsToken = {
      ...token,
      componentCls: `.${prefixCls}`,
      cardActionIconSize: token.fontSizeLG,
    }

    return [genActionsStyle(proCardActionsToken)]
  })
}
