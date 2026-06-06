import type { CSSProperties } from 'vue'
import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import type { MenuMode } from '../types'
import { useStyle as useAntdStyle } from '../../../../provider'

export interface ProLayoutBaseMenuToken extends ProAliasToken {
  componentCls: string
}

export function getProLayoutSiderCssVarsStyle(): CSSProperties {
  return {}
}

const genProLayoutBaseMenuStyle: GenerateStyle<ProLayoutBaseMenuToken> = token => ({
  [token.componentCls]: {
    boxSizing: 'border-box',
  },
})

export function useStyle(prefixCls: string, mode: MenuMode | undefined) {
  return useAntdStyle(`ProLayoutBaseMenu-${prefixCls}-${mode || 'vertical'}`, (token) => {
    const proLayoutMenuToken: ProLayoutBaseMenuToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genProLayoutBaseMenuStyle(proLayoutMenuToken)]
  })
}
