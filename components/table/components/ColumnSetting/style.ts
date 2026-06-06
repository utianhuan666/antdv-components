import type { GenerateStyle, ProAliasToken } from '../../../provider'
import { useStyle as useAntdStyle } from '../../../provider'

export interface ProToken extends ProAliasToken {
  componentCls: string
}

const genProStyle: GenerateStyle<ProToken> = token => ({
  [token.componentCls]: {
    'boxSizing': 'border-box',
    'width': 'auto',
    '&-title': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '32px',
    },
    '&-overlay': {
      zIndex: token.zIndexPopupBase,
      [`${token.antCls}-popover-inner`]: {
        minWidth: '200px',
      },
      [`${token.antCls}-tree-node-content-wrapper:hover`]: {
        backgroundColor: 'transparent',
      },
      [`${token.antCls}-tree-treenode`]: {
        alignItems: 'center',
        [`${token.antCls}-tree-checkbox`]: {
          marginInlineEnd: '4px',
        },
      },
    },
  },
  [`${token.componentCls}-action-rest-button`]: {
    color: token.colorPrimary,
  },
  [`${token.componentCls}-list`]: {
    'display': 'flex',
    'flexDirection': 'column',
    'width': '100%',
    'paddingBlockStart': 8,
    [`&${token.componentCls}-list-group`]: {
      paddingBlockStart: 0,
    },
    '&-title': {
      marginBlockStart: '6px',
      marginBlockEnd: '6px',
      paddingInlineStart: '24px',
      color: token.colorTextSecondary,
      fontSize: '12px',
    },
    '&-item': {
      'display': 'flex',
      'alignItems': 'center',
      'maxHeight': 24,
      'justifyContent': 'space-between',
      '&-title': {
        flex: 1,
        maxWidth: 80,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        wordBreak: 'break-all',
        whiteSpace: 'nowrap',
      },
      '&-option': {
        'display': 'inline-flex',
        'float': 'right',
        'cursor': 'pointer',
        '> span + span': {
          marginInlineStart: 4,
        },
        '> span > span.anticon': {
          color: token.colorPrimary,
        },
      },
    },
  },
})

export default function useStyle(prefixCls: string) {
  return useAntdStyle('ColumnSetting', (token) => {
    const proToken: ProToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genProStyle(proToken)]
  })
}
