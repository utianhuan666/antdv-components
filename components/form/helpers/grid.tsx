import type { InjectionKey } from 'vue'
import type { ProFormGridConfig } from '../typing'
import { inject, provide } from 'vue'

export const GridContext: InjectionKey<ProFormGridConfig> = Symbol('GridContext')

export function provideGridContext(value: ProFormGridConfig) {
  provide(GridContext, value)
}

export function useGridContext() {
  return inject(GridContext, {})
}

export function useGridHelpers(config: ProFormGridConfig = {}) {
  return {
    grid: config.grid,
    colProps: config.colProps ?? { xs: 24 },
    rowProps: config.rowProps ?? { gutter: 8 },
  }
}
