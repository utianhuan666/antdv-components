import type { InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'

export interface GridContextValue {
  grid: boolean
  rowProps?: Record<string, any>
  colProps?: Record<string, any>
}

export const GridContextKey: InjectionKey<GridContextValue> = Symbol('ProFormGridContext')

const defaultRowProps = { gutter: 8 }
const defaultColProps = { xs: 24 }

export function provideGridContext(value: GridContextValue) {
  provide(GridContextKey, value)
}

export function useGridContext(): GridContextValue {
  return inject(GridContextKey, { grid: false })
}

/** 类似 React 版 useGridHelpers：给字段决定是否包 Col、用什么 colProps */
export function useGridHelpers(itemColProps?: Record<string, any>) {
  const ctx = useGridContext()

  const colProps = computed(() => ({
    ...defaultColProps,
    ...(ctx.colProps || {}),
    ...(itemColProps || {}),
  }))

  const rowProps = computed(() => ({
    ...defaultRowProps,
    ...(ctx.rowProps || {}),
  }))

  return {
    grid: computed(() => Boolean(ctx.grid)),
    colProps,
    rowProps,
  }
}
