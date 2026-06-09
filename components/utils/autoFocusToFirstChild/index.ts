import type { VNode, VNodeChild } from 'vue'
import { cloneVNode, Fragment, h, isVNode } from 'vue'

/**
 * 将 autoFocus 应用到第一个子节点；若首个子节点是 Fragment，则递归应用到其第一个子节点，
 * 避免向 Fragment 传入非法 props。
 */
export function autoFocusToFirstChild(node: VNodeChild, autoFocus: boolean): VNodeChild {
  if (!autoFocus || !isVNode(node))
    return node
  if (node.type === Fragment) {
    const children = Array.isArray(node.children) ? node.children : []
    const newChildren = children.map((child, index) => index === 0 ? autoFocusToFirstChild(child as VNode, autoFocus) : child)
    return h(Fragment, null, newChildren)
  }
  return cloneVNode(node, {
    ...(node.props || {}),
    autoFocus,
  })
}
