import { useStyle as useAntdStyle } from '../../../provider'

export default function useStyle(_prefixCls: string) {
  return useAntdStyle('ProCardDivider', () => ({}))
}
