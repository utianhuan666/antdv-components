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

export const MediaQueryEnum: MediaQueryEnumShape = {
  xs: { maxWidth: 575, matchMedia: '(max-width: 575px)' },
  sm: { minWidth: 576, maxWidth: 767, matchMedia: '(min-width: 576px) and (max-width: 767px)' },
  md: { minWidth: 768, maxWidth: 991, matchMedia: '(min-width: 768px) and (max-width: 991px)' },
  lg: { minWidth: 992, maxWidth: 1199, matchMedia: '(min-width: 992px) and (max-width: 1199px)' },
  xl: { minWidth: 1200, maxWidth: 1599, matchMedia: '(min-width: 1200px) and (max-width: 1599px)' },
  xxl: { minWidth: 1600, matchMedia: '(min-width: 1600px)' },
}

export function getScreenClassName(): MediaQueryKey | undefined {
  if (typeof window === 'undefined')
    return undefined
  return BREAKPOINT_PRIORITY.find(key => window.matchMedia(MediaQueryEnum[key].matchMedia).matches)
}

function useBreakpoint() {
  const isXs = useMediaQuery(MediaQueryEnum.xs.matchMedia)
  const isSm = useMediaQuery(MediaQueryEnum.sm.matchMedia)
  const isMd = useMediaQuery(MediaQueryEnum.md.matchMedia)
  const isLg = useMediaQuery(MediaQueryEnum.lg.matchMedia)
  const isXl = useMediaQuery(MediaQueryEnum.xl.matchMedia)
  const isXxl = useMediaQuery(MediaQueryEnum.xxl.matchMedia)

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
