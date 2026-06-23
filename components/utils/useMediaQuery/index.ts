import { theme } from 'antdv-next'
import { computed } from 'vue'
import useMediaQuery from './query'

interface MediaQueryItem {
  minWidth?: number
  maxWidth?: number
  matchMedia: string
}

interface MediaQueryEnumShape {
  xs: MediaQueryItem
  sm: MediaQueryItem
  md: MediaQueryItem
  lg: MediaQueryItem
  xl: MediaQueryItem
  xxl: MediaQueryItem
}

export type MediaQueryKey = keyof MediaQueryEnumShape

const BREAKPOINT_PRIORITY: MediaQueryKey[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']

let cachedMediaQueryEnum: MediaQueryEnumShape | undefined

function getMediaQueryEnum(): MediaQueryEnumShape {
  if (cachedMediaQueryEnum)
    return cachedMediaQueryEnum

  const token = theme.getDesignToken()
  cachedMediaQueryEnum = {
    xs: { maxWidth: token.screenXSMax, matchMedia: `(max-width: ${token.screenXSMax}px)` },
    sm: { minWidth: token.screenSMMin, maxWidth: token.screenSMMax, matchMedia: `(min-width: ${token.screenSMMin}px) and (max-width: ${token.screenSMMax}px)` },
    md: { minWidth: token.screenMDMin, maxWidth: token.screenMDMax, matchMedia: `(min-width: ${token.screenMDMin}px) and (max-width: ${token.screenMDMax}px)` },
    lg: { minWidth: token.screenLGMin, maxWidth: token.screenLGMax, matchMedia: `(min-width: ${token.screenLGMin}px) and (max-width: ${token.screenLGMax}px)` },
    xl: { minWidth: token.screenXLMin, maxWidth: token.screenXLMax, matchMedia: `(min-width: ${token.screenXLMin}px) and (max-width: ${token.screenXLMax}px)` },
    xxl: { minWidth: token.screenXXLMin, matchMedia: `(min-width: ${token.screenXXLMin}px)` },
  }
  return cachedMediaQueryEnum
}

export const MediaQueryEnum: MediaQueryEnumShape = new Proxy({} as MediaQueryEnumShape, {
  get(_target, prop: string) {
    return getMediaQueryEnum()[prop as MediaQueryKey]
  },
  ownKeys() {
    return Object.keys(getMediaQueryEnum())
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    const value = getMediaQueryEnum()[prop as MediaQueryKey]
    return value
      ? { configurable: true, enumerable: true, value, writable: false }
      : undefined
  },
})

export function getScreenClassName(): MediaQueryKey | undefined {
  if (typeof window === 'undefined')
    return undefined
  const enumValue = getMediaQueryEnum()
  return BREAKPOINT_PRIORITY.find(key => window.matchMedia(enumValue[key].matchMedia).matches)
}

function useBreakpoint() {
  const enumValue = getMediaQueryEnum()
  const isXs = useMediaQuery(enumValue.xs.matchMedia)
  const isSm = useMediaQuery(enumValue.sm.matchMedia)
  const isMd = useMediaQuery(enumValue.md.matchMedia)
  const isLg = useMediaQuery(enumValue.lg.matchMedia)
  const isXl = useMediaQuery(enumValue.xl.matchMedia)
  const isXxl = useMediaQuery(enumValue.xxl.matchMedia)

  return computed<MediaQueryKey>(() => {
    if (isXxl.value)
      return 'xxl'
    if (isXl.value)
      return 'xl'
    if (isLg.value)
      return 'lg'
    if (isMd.value)
      return 'md'
    if (isSm.value)
      return 'sm'
    if (isXs.value)
      return 'xs'
    return 'md'
  })
}

export { useBreakpoint }
