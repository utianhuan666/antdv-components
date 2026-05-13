/**
 * 对标 React `src/form/layouts/QueryFilter/index.tsx` 中的断点 / span 推导工具，
 * 抽离为纯函数便于测试。所有断点取自 antd 设计 token，与 Grid 响应式保持一致。
 */

export type QueryFilterLayout = 'horizontal' | 'vertical' | 'inline'

export interface SpanConfigObject {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export type SpanConfig = number | SpanConfigObject

export interface BreakpointsConfig {
  /** 不同 layout 下，依据容器宽度匹配的列数与默认布局 */
  breakpoints: {
    vertical: (string | number)[][]
    default: (string | number)[][]
  }
  /** 不同 size key 对应的最小宽度，用于 span 为响应式对象时取值 */
  configSpanBreakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
}

export interface DesignTokenLike {
  screenSMMin?: number
  screenMDMin?: number
  screenLGMin?: number
  screenXLMin?: number
  screenXXLMin?: number
}

const DEFAULT_TOKEN: Required<DesignTokenLike> = {
  screenSMMin: 576,
  screenMDMin: 768,
  screenLGMin: 992,
  screenXLMin: 1200,
  screenXXLMin: 1600,
}

export function getBreakpointsConfig(token: DesignTokenLike = {}): BreakpointsConfig {
  const t = { ...DEFAULT_TOKEN, ...token }
  const bp = {
    xs: t.screenSMMin,
    sm: t.screenMDMin,
    md: t.screenLGMin,
    lg: t.screenXLMin,
    xl: t.screenXXLMin,
    xxl: Infinity,
  } as const

  return {
    configSpanBreakpoints: bp,
    breakpoints: {
      vertical: [
        [bp.xs, 1, 'vertical'],
        [bp.md, 2, 'vertical'],
        [bp.xl, 3, 'vertical'],
        [Infinity, 4, 'vertical'],
      ],
      default: [
        [bp.xs, 1, 'vertical'],
        [bp.sm, 2, 'vertical'],
        [bp.xl, 3, 'horizontal'],
        [Infinity, 4, 'horizontal'],
      ],
    },
  }
}

/**
 * 根据当前布局、容器宽度、span 配置计算单项 span 与最终 layout。
 */
export function getSpanConfig(
  layout: QueryFilterLayout | undefined,
  width: number,
  span: SpanConfig | undefined,
  breakpointsConfig: BreakpointsConfig,
): { span: number, layout: QueryFilterLayout } {
  if (typeof span === 'number') {
    return {
      span,
      layout: layout || 'horizontal',
    }
  }

  const { breakpoints, configSpanBreakpoints } = breakpointsConfig
  const spanRecord = span as unknown as Record<string, number>
  const spanConfig: (string | number)[][] = span
    ? (['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((key) => {
        return [configSpanBreakpoints[key], 24 / (spanRecord[key] || 1), 'horizontal']
      })
    : breakpoints[layout === 'vertical' ? 'vertical' : 'default']

  const breakPoint = (spanConfig || breakpoints.default).find((item) => {
    return width < (item[0] as number) + 16
  })

  if (!breakPoint) {
    return {
      span: 8,
      layout: 'horizontal',
    }
  }

  const colCount = Number(breakPoint[1]) || 1
  return {
    span: 24 / colCount,
    layout: (breakPoint[2] as QueryFilterLayout) || 'horizontal',
  }
}
