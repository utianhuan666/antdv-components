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
  /**
   * 命中此媒体查询时停用测量、把高度置为 `null`，让外部 CSS 接管。
   * 典型场景：响应式断点下从「左右双栏定高」切换到「上下堆叠 height:auto」。
   */
  disableQuery?: string
}

/**
 * 计算元素顶部到视口底部的可用高度。
 *
 * 用于 PageContainer 内的「左预览右配置 / 左树右表 / 单卡片填满」类布局：
 * 改成实测 `getBoundingClientRect().top` 一次解决各级偏移。
 *
 * 监听 `window resize`、`ResizeObserver(parent)`、`MediaQueryList change`。
 *
 * @example
 * const [wrapperRef, height] = useAvailableHeight({ disableQuery: '(max-width: 1400px)' })
 * // template: <div ref="wrapperRef" :style="height ? { height: `${height}px` } : undefined">...</div>
 */
export function useAvailableHeight<T extends HTMLElement = HTMLDivElement>(
  options: UseAvailableHeightOptions = {},
): [Ref<T | null>, Ref<number | null>] {
  const { disableQuery } = options
  const nodeRef = ref(null) as Ref<T | null>
  const height = ref<number | null>(null)
  let cleanup: (() => void) | undefined

  onMounted(() => {
    const node = nodeRef.value
    if (!node)
      return
    const mql = disableQuery ? window.matchMedia(disableQuery) : null
    const measure = () => {
      if (mql?.matches) {
        height.value = null
        return
      }
      const top = node.getBoundingClientRect().top
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight
      const bottomInset = getNearestBottomInset(node)
      height.value = Math.max(0, Math.floor(viewportHeight - top - bottomInset))
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
