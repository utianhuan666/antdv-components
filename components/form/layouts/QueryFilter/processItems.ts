import type { VNode, VNodeChild } from 'vue'
import type { QueryFilterLayout } from './breakpoints'
import { cloneVNode, Comment, Fragment, isVNode, Text } from 'vue'

export interface ProcessedQueryFilterItem {
  itemDom: VNode | null
  hidden: boolean
  colSpan: number
}

export interface ProcessQueryFilterItemsOptions {
  items: VNodeChild
  spanSize: { span: number, layout: QueryFilterLayout }
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

function isVisibleVNode(node: VNodeChild): node is VNode {
  if (!isVNode(node))
    return false
  if (node.type === Comment)
    return false
  if (node.type === Text && typeof node.children === 'string' && !node.children.trim())
    return false
  return true
}

/**
 * 展开无 title 的 ProForm.Group，可选去除 rules，对应 React `flatMapQueryFilterItems`。
 */
export function flattenQueryFilterItems(items: VNodeChild, ignoreRules?: boolean): VNode[] {
  const result: VNode[] = []
  const list = Array.isArray(items) ? items : [items]
  for (const node of list) {
    if (!isVisibleVNode(node))
      continue
    if (node.type === Fragment) {
      result.push(...flattenQueryFilterItems(node.children as VNodeChild, ignoreRules))
      continue
    }
    const componentName = (node.type as any)?.name || (node.type as any)?.displayName
    const props = (node.props || {}) as Record<string, any>
    if (componentName === 'ProFormGroup' && !props.title) {
      const groupChildren = (node.children as any)?.default?.() ?? node.children
      result.push(...flattenQueryFilterItems(groupChildren as VNodeChild, ignoreRules))
      continue
    }
    if (ignoreRules) {
      const formItemProps = { ...(props.formItemProps || {}), rules: [] }
      result.push(cloneVNode(node, { formItemProps }))
      continue
    }
    result.push(node)
  }
  return result
}

/**
 * 纯函数：计算 QueryFilter 的表单项布局信息。对标 React `processQueryFilterItems`。
 */
export function processQueryFilterItems(
  options: ProcessQueryFilterItemsOptions,
): ProcessQueryFilterItemsResult {
  const { items, spanSize, collapsed, showLength, preserve, ignoreRules } = options
  const flatItems = flattenQueryFilterItems(items, ignoreRules)

  let totalSpan = 0
  let totalSize = 0
  let firstRowFull = false

  const processedList: ProcessedQueryFilterItem[] = flatItems.map((item, index) => {
    const itemProps = (item.props || {}) as Record<string, any>
    const colSize = Number(itemProps.colSize ?? 1) || 1
    const colSpan = Math.min(spanSize.span * colSize, 24)

    totalSpan += colSpan
    totalSize += colSize

    if (index === 0)
      firstRowFull = colSpan === 24 && !itemProps.hidden

    const hidden: boolean
      = !!itemProps.hidden
        || (collapsed && (firstRowFull || totalSize > showLength) && !!index)

    if (hidden) {
      if (!preserve)
        return { itemDom: null, colSpan: 0, hidden: true }
      return { itemDom: cloneVNode(item, { hidden: true }), colSpan, hidden: true }
    }

    return { itemDom: item, colSpan, hidden: false }
  })

  let runningSpan = 0
  for (const { hidden, colSpan } of processedList) {
    if (hidden)
      continue
    if (24 - (runningSpan % 24) < colSpan)
      runningSpan += 24 - (runningSpan % 24)
    runningSpan += colSpan
  }
  const lastRowUsedSpan = runningSpan % 24

  return { processedList, totalSpan, totalSize, lastRowUsedSpan }
}

/**
 * 根据最后一行已占用的 span 与提交按钮列 span，计算提交按钮的 Col offset。
 * 对标 React `calcSubmitterOffset`。
 */
export function calcSubmitterOffset(lastRowUsedSpan: number, submitterSpan: number): number {
  const offsetSpan = lastRowUsedSpan + submitterSpan
  if (offsetSpan > 24)
    return 24 - submitterSpan
  return 24 - offsetSpan
}
