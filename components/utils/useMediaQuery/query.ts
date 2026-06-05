import { onMounted, onScopeDispose, ref } from 'vue'

export default function useMediaQuery(mediaQuery: string) {
  const matches = ref(false)
  let cleanup: (() => void) | undefined

  onMounted(() => {
    if (typeof window === 'undefined')
      return
    const mediaQueryList = window.matchMedia(mediaQuery)
    matches.value = mediaQueryList.matches
    const listener = (event: MediaQueryListEvent) => {
      matches.value = event.matches
    }
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', listener)
      cleanup = () => mediaQueryList.removeEventListener('change', listener)
    }
    else {
      mediaQueryList.addListener(listener)
      cleanup = () => mediaQueryList.removeListener(listener)
    }
  })

  onScopeDispose(() => cleanup?.())
  return matches
}
