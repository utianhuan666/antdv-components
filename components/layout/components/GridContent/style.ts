import type { CSSObject } from '@antdv-next/cssinjs'
import type { AliasToken } from 'antdv-next/dist/theme/interface/alias'
import type { Ref } from 'vue'
import { genProStyleHooks } from '../../../theme/genProStyleUtils'
import { proLayoutVar } from '../../style'

type ProGridContentToken = AliasToken & {
  componentCls: string
}

function genGridContentStyle(token: ProGridContentToken): CSSObject {
  return {
    [token.componentCls]: {
      'boxSizing': 'border-box',
      'width': '100%',
      '&-wide': {
        width: `min(100%, var(${proLayoutVar.contentFixedMaxWidth}))`,
        marginInline: 'auto',
      },
      [`${token.componentCls}-children`]: {
        boxSizing: 'border-box',
        width: '100%',
      },
    },
  }
}

export const useProGridContentStyle = genProStyleHooks(
  'ProGridContent',
  genGridContentStyle,
)

export function useStyle(prefixCls: Ref<string>) {
  const [hashId, cssVarCls] = useProGridContentStyle(prefixCls)
  return { hashId, cssVarCls }
}
