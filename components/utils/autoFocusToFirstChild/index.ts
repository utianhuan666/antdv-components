import type { VNode, VNodeChild } from 'vue'
import { cloneVNode, Fragment, h, isVNode } from 'vue'

export function autoFocusToFirstChild(node: VNodeChild, autoFocus: boolean): VNodeChild {
  if (!autoFocus || !isVNode(node))
    return node
  if (node.type === Fragment) {
    const children = Array.isArray(node.children) ? node.children : []
    return h(Fragment, null, children.map((child, index) => index === 0 ? autoFocusToFirstChild(child as VNode, autoFocus) : child))
  }
  return cloneVNode(node, {
    ...(node.props || {}),
    autoFocus,
  })
}
