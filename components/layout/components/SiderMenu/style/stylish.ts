import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import { useStyle as useAntdStyle } from '../../../../provider'

export interface SiderMenuToken extends ProAliasToken {
  componentCls: string
}

export function useStylish(className: string, options: { stylish?: GenerateStyle<ProAliasToken> }) {
  return useAntdStyle(`ProLayoutSiderStylish-${className}`, token => ({
    [`.${className}`]: options.stylish ? options.stylish(token) : {},
  }))
}
