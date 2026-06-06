import { computed, onMounted, onScopeDispose, ref, watchEffect } from 'vue'

function setQueryToCurrentUrl(params: Record<string, unknown>): URL {
  const href = typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/'
  const url = new URL(href)
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        url.searchParams.delete(key)
        value.forEach(valueItem => url.searchParams.append(key, String(valueItem)))
      }
      else if (value instanceof Date) {
        if (!Number.isNaN(value.getTime()))
          url.searchParams.set(key, value.toISOString())
      }
      else if (typeof value === 'object') {
        url.searchParams.set(key, JSON.stringify(value))
      }
      else {
        url.searchParams.set(key, String(value))
      }
    }
    else {
      url.searchParams.delete(key)
    }
  })
  return url
}

export function useUrlSearchParams(
  initial: Record<string, string | number> = {},
  config: { disabled?: boolean } = { disabled: false },
) {
  const version = ref(0)
  const params = computed(() => {
    void version.value
    if (config.disabled || typeof window === 'undefined' || !window.URL)
      return {}
    const search = new URLSearchParams(window.location.search)
    const next: Record<string, string | number | boolean | string[]> = { ...initial }
    const grouped: Record<string, string[]> = {}
    search.forEach((value, key) => {
      ;(grouped[key] ||= []).push(value)
    })
    Object.keys(grouped).forEach((key) => {
      const group = grouped[key] || []
      const value = group.length === 1 ? group[0]! : group
      if (value === 'true' || value === 'false')
        next[key] = value === 'true'
      else
        next[key] = value
    })
    return next
  })

  function redirectToNewSearchParams(newParams: Record<string, unknown>) {
    if (typeof window === 'undefined' || !window.URL)
      return
    const url = setQueryToCurrentUrl(newParams)
    if (window.location.search !== url.search) {
      window.history.replaceState({}, '', url.toString())
      version.value += 1
    }
  }

  watchEffect(() => {
    if (!config.disabled)
      redirectToNewSearchParams({ ...initial, ...params.value })
  })

  let removePopStateListener = () => {}

  onMounted(() => {
    if (config.disabled || typeof window === 'undefined' || !window.URL)
      return
    const onPopState = () => {
      version.value += 1
    }
    window.addEventListener('popstate', onPopState)
    removePopStateListener = () => {
      window.removeEventListener('popstate', onPopState)
    }
  })

  onScopeDispose(() => {
    removePopStateListener()
  })

  return [params, redirectToNewSearchParams] as const
}
