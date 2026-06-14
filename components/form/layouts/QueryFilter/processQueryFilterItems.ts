import type { FormProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { isVNode } from 'vue'
import { cloneElement, getVNodeChildren, getVNodeProps, getVNodeTypeName } from '../_shared/vueHelpers'

export interface ProcessedQueryFilterItem {
  itemDom: VNodeChild | null
  hidden: boolean
  colSpan: number
}

export interface ProcessQueryFilterItemsOptions {
  items: VNodeChild[]
  spanSize: { span: number, layout: FormProps['layout'] }
  collapsed: boolean
  showLength: number
  preserve?: boolean
  ignoreRules?: boolean
}

export interface ProcessQueryFilterItemsResult {
  processedList: ProcessedQueryFilterItem[]
  totalSpan: number
  totalSize: number
  lastRowUsedSpan: number
}

export function flatMapQueryFilterItems(items: VNodeChild[], ignoreRules?: boolean): VNodeChild[] {
  return (items || []).flatMap((item) => {
    if (getVNodeTypeName(item) === 'ProForm-Group' && !getVNodeProps(item).title)
      return getVNodeChildren(item)
    if (ignoreRules && isVNode(item)) {
      const props = getVNodeProps(item)
      return cloneElement(item, {
        formItemProps: {
          ...(props.formItemProps || {}),
          rules: [],
        },
      })
    }
    return item
  })
}

export function processQueryFilterItems(options: ProcessQueryFilterItemsOptions): ProcessQueryFilterItemsResult {
  const { spanSize, collapsed, showLength, preserve, ignoreRules } = options
  const flatItems = flatMapQueryFilterItems(options.items, ignoreRules)
  let totalSpan = 0
  let totalSize = 0
  let firstRowFull = false

  const processedList = flatItems.map((item, index) => {
    const props = getVNodeProps(item)
    const colSize = props.colSize ?? 1
    const colSpan = Math.min(spanSize.span * (colSize || 1), 24)
    totalSpan += colSpan
    totalSize += colSize

    if (index === 0)
      firstRowFull = colSpan === 24 && !props.hidden

    const hidden = !!props.hidden || (collapsed && (firstRowFull || totalSize > showLength) && !!index)
    if (isVNode(item) && hidden) {
      if (!preserve)
        return { itemDom: null, hidden: true, colSpan: 0 }
      return {
        itemDom: cloneElement(item, {
          hidden: true,
          key: item.key || props.name || index,
        }),
        hidden: true,
        colSpan,
      }
    }

    return { itemDom: item, hidden: false, colSpan }
  })

  let runningSpan = 0
  processedList.forEach(({ itemDom, colSpan }) => {
    if (!itemDom || getVNodeProps(itemDom).hidden)
      return
    if (24 - (runningSpan % 24) < colSpan)
      runningSpan += 24 - (runningSpan % 24)
    runningSpan += colSpan
  })

  return {
    processedList,
    totalSpan,
    totalSize,
    lastRowUsedSpan: runningSpan % 24,
  }
}

export function calcSubmitterOffset(lastRowUsedSpan = 0, submitterSpan = 0): number {
  const offsetSpan = lastRowUsedSpan + submitterSpan
  if (offsetSpan > 24)
    return 24 - submitterSpan
  return 24 - offsetSpan
}
