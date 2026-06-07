import type { ComputedRef, MaybeRef } from 'vue'
import type { BaseFormProps } from './BaseForm'
import { computed, onMounted, ref, unref, watch } from 'vue'
import { runFunction, useUrlSearchParams } from '../../utils'

export function genUrlSyncParams(syncUrl: BaseFormProps<any>['syncToUrl'], params: Record<string, any>, type: 'get' | 'set'): Record<string, any> {
  if (syncUrl === true)
    return params
  return runFunction(syncUrl, params, type)
}

export interface UseUrlSyncOptions<T> {
  syncToUrl?: MaybeRef<boolean | ((values: T, type: 'get' | 'set') => T) | undefined>
  syncToInitialValues?: MaybeRef<boolean | undefined>
  extraUrlParams?: MaybeRef<Record<string, any> | undefined>
}

export interface UseUrlSyncResult {
  urlParamsMergeInitialValues: ComputedRef<Record<string, any>>
  onUrlSyncReset: (
    finalValues: Record<string, any>,
    extraUrlParams?: Record<string, any>,
  ) => void
  onUrlSyncFinish: (
    finalValues: Record<string, any>,
    allFieldKeys: string[],
    extraUrlParams?: Record<string, any>,
  ) => void
}

export function useUrlSync<T = Record<string, any>>({
  syncToUrl,
  syncToInitialValues,
  extraUrlParams,
}: UseUrlSyncOptions<T>): UseUrlSyncResult {
  const syncToUrlValue = computed(() => unref(syncToUrl))
  const syncToInitialValuesValue = computed(() => unref(syncToInitialValues))
  const extraUrlParamsValue = computed(() => unref(extraUrlParams) || {})
  const [urlSearch, setUrlSearch] = useUrlSearchParams({}, { disabled: !syncToUrlValue.value })
  const urlParams = ref<Record<string, any>>(
    syncToUrlValue.value
      ? genUrlSyncParams(syncToUrlValue.value, urlSearch.value, 'get')
      : {},
  )

  onMounted(() => {
    if (!syncToInitialValuesValue.value)
      urlParams.value = {}
  })

  watch(syncToInitialValuesValue, (value, oldValue) => {
    if (oldValue !== undefined && !value)
      urlParams.value = {}
  })

  watch(extraUrlParamsValue, () => {
    if (!syncToUrlValue.value)
      return
    setUrlSearch(genUrlSyncParams(syncToUrlValue.value, {
      ...urlSearch.value,
      ...extraUrlParamsValue.value,
    }, 'set'))
  }, { deep: true })

  const onUrlSyncReset = (
    finalValues: Record<string, any>,
    currentExtraUrlParams?: Record<string, any>,
  ) => {
    if (!syncToUrlValue.value)
      return
    const params = Object.keys(finalValues || {}).reduce<Record<string, any>>((accumulated, key) => ({
      ...accumulated,
      [key]: finalValues[key] || undefined,
    }), currentExtraUrlParams ?? {})
    setUrlSearch(genUrlSyncParams(syncToUrlValue.value, params, 'set'))
  }

  const onUrlSyncFinish = (
    finalValues: Record<string, any>,
    allFieldKeys: string[],
    currentExtraUrlParams?: Record<string, any>,
  ) => {
    if (!syncToUrlValue.value)
      return

    const syncToUrlParams = allFieldKeys.reduce<Record<string, any>>((accumulated, key) => ({
      ...accumulated,
      [key]: finalValues[key] ?? undefined,
    }), currentExtraUrlParams ?? {})

    Object.keys(urlSearch.value).forEach((key) => {
      if (
        syncToUrlParams[key] !== false
        && syncToUrlParams[key] !== 0
        && !syncToUrlParams[key]
      ) {
        syncToUrlParams[key] = undefined
      }
    })

    setUrlSearch(genUrlSyncParams(syncToUrlValue.value, syncToUrlParams, 'set'))
  }

  return {
    urlParamsMergeInitialValues: computed(() => urlParams.value),
    onUrlSyncReset,
    onUrlSyncFinish,
  }
}
