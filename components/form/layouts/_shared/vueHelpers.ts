import type { Ref, VNodeChild } from 'vue'
import { cloneVNode, Fragment, isVNode } from 'vue'

export type MaybeRefTarget<T>
  = | Ref<T | undefined | null>
    | { current?: T | undefined | null }
    | ((value: T | undefined | null) => void)
    | undefined
    | null

export function setRefValue<T>(target: MaybeRefTarget<T>, value: T | undefined | null) {
  if (!target)
    return
  if (typeof target === 'function') {
    target(value)
    return
  }
  if ('value' in target) {
    target.value = value
    return
  }
  target.current = value
}

export function getVNodeProps<T extends Record<string, any> = Record<string, any>>(node: VNodeChild): T {
  return (isVNode(node) ? (node.props || {}) : {}) as T
}

export function getVNodeTypeName(node: VNodeChild): string | undefined {
  if (!isVNode(node))
    return undefined
  const type = node.type as any
  return type?.displayName || type?.name
}

export function getVNodeChildren(node: VNodeChild): VNodeChild[] {
  if (!isVNode(node))
    return []
  const children = node.children
  if (Array.isArray(children))
    return children as VNodeChild[]
  if (typeof children === 'function') {
    const result = (children as () => VNodeChild | VNodeChild[])()
    return Array.isArray(result) ? result : [result]
  }
  return children == null ? [] : [children as VNodeChild]
}

export function flattenChildren(children: VNodeChild | VNodeChild[] | undefined): VNodeChild[] {
  const list = Array.isArray(children) ? children : children == null ? [] : [children]
  return list.flatMap((item) => {
    if (isVNode(item) && item.type === Fragment)
      return flattenChildren(getVNodeChildren(item))
    return item == null || item === false ? [] : [item]
  })
}

export function cloneElement(node: VNodeChild, props?: Record<string, any>): VNodeChild {
  if (!isVNode(node))
    return node
  return cloneVNode(node, props || {}, true)
}

export function omitKeys<T extends Record<string, any>, K extends keyof T>(source: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...source }
  keys.forEach(key => delete result[key])
  return result
}
