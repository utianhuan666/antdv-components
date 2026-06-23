import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import { useStyle as useAntdStyle } from '../../../../provider'

export function useStylish(className: string, options: { stylish?: GenerateStyle<ProAliasToken> }) {
  return useAntdStyle(`ProLayoutHeaderStylish-${className}`, token => ({
    [`.${className}`]: options.stylish ? options.stylish(token) : {},
  }))
}
