import type { Ref } from 'vue'
import { onMounted, onScopeDispose, ref } from 'vue'

function getNearestBottomInset(node: HTMLElement): number {
  let cur: HTMLElement | null = node.parentElement
  while (cur && cur !== document.body && cur !== document.documentElement) {
    const style = window.getComputedStyle(cur)
    const paddingBottom = Number.parseFloat(style.paddingBottom || '0') || 0
    const borderBottom = Number.parseFloat(style.borderBottomWidth || '0') || 0
    const inset = paddingBottom + borderBottom
    if (inset > 0)
      return inset
    cur = cur.parentElement
  }
  return 0
}

export interface UseAvailableHeightOptions {
  disableQuery?: string
}

export function useAvailableHeight<T extends HTMLElement = HTMLDivElement>(
  options: UseAvailableHeightOptions = {},
): [Ref<T | null>, Ref<number | null>] {
  const nodeRef = ref(null) as Ref<T | null>
  const height = ref<number | null>(null)
  let cleanup: (() => void) | undefined

  onMounted(() => {
    const node = nodeRef.value
    if (!node)
      return
    const mql = options.disableQuery ? window.matchMedia(options.disableQuery) : null
    const measure = () => {
      if (mql?.matches) {
        height.value = null
        return
      }
      const top = node.getBoundingClientRect().top
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight
      height.value = Math.max(0, Math.floor(viewportHeight - top - getNearestBottomInset(node)))
    }
    measure()
    window.addEventListener('resize', measure)
    mql?.addEventListener('change', measure)
    const vv = window.visualViewport
    vv?.addEventListener('resize', measure)
    vv?.addEventListener('scroll', measure)
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(node)
      if (node.parentElement)
        observer.observe(node.parentElement)
      if (node.parentElement?.parentElement)
        observer.observe(node.parentElement.parentElement)
    }
    cleanup = () => {
      window.removeEventListener('resize', measure)
      mql?.removeEventListener('change', measure)
      vv?.removeEventListener('resize', measure)
      vv?.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  })

  onScopeDispose(() => cleanup?.())
  return [nodeRef, height]
}
