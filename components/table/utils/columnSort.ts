import type { ColumnsState } from '../Store/Provide'

export function columnSort(columnsMap: Record<string, ColumnsState>) {
  return (a: any, b: any) => {
    const { fixed: aFixed, index: aIndex } = a
    const { fixed: bFixed, index: bIndex } = b
    if (
      (aFixed === 'left' && bFixed !== 'left')
      || (bFixed === 'right' && aFixed !== 'right')
    ) {
      return -2
    }
    if (
      (bFixed === 'left' && aFixed !== 'left')
      || (aFixed === 'right' && bFixed !== 'right')
    ) {
      return 2
    }
    const aKey = a.key || `${aIndex}`
    const bKey = b.key || `${bIndex}`
    if (columnsMap?.[aKey]?.order || columnsMap?.[bKey]?.order) {
      return (
        (columnsMap?.[aKey]?.order || 0)
        - (columnsMap?.[bKey]?.order || 0)
      )
    }
    return (a.index || 0) - (b.index || 0)
  }
}
