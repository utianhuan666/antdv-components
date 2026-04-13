import type { Ref } from 'vue'
import type { FieldSelectProps, ProFieldValueEnumType } from './types'
import { computed, ref, watch } from 'vue'
import { objectToMap, proFieldParsingValueEnumToArray } from './utils'

type SelectOption = Record<string, any>

/**
 * Recursively filter options by keyword.
 */
function filterByItem(
  item: { label?: string, value?: string, optionType?: string, children?: any[], options?: any[] },
  keyWords?: string,
): boolean {
  if (!keyWords)
    return true
  if (
    item?.label?.toString().toLowerCase().includes(keyWords.toLowerCase())
    || item?.value?.toString().toLowerCase().includes(keyWords.toLowerCase())
  ) {
    return true
  }
  if (item.children || item.options) {
    const found = [...(item.children || []), ...(item.options || [])].find(mapItem =>
      filterByItem(mapItem, keyWords),
    )
    if (found)
      return true
  }
  return false
}

/**
 * Get options from valueEnum.
 */
function getOptionsFromValueEnum(coverValueEnum: ProFieldValueEnumType): SelectOption[] {
  return proFieldParsingValueEnumToArray(objectToMap(coverValueEnum)).map(
    ({ value, text, ...rest }) => ({
      ...rest,
      value,
      key: value,
      label: text,
    }),
  )
}

/**
 * Composable that replaces React's useSWR with Vue-native ref + watch + async fetch.
 *
 * Returns [loading, options, fetchData, resetData]
 */
export function useFieldFetchData(
  props: FieldSelectProps & {
    proFieldKey?: string | number
    defaultKeyWords?: string
    cacheForSwr?: boolean
  },
): [Ref<boolean>, Ref<SelectOption[]>, (keyWord?: string) => void, () => void] {
  const { fieldProps } = props

  const keyWords = ref<string | undefined>(props.defaultKeyWords)
  const loading = ref(false)
  const requestData = ref<SelectOption[] | null>(null)

  // Compute options from valueEnum
  const valueEnumOptions = computed(() => {
    if (!props.valueEnum)
      return []
    return getOptionsFromValueEnum(props.valueEnum)
  })

  // Default options from fieldProps.options or fieldProps.treeData
  const defaultFieldOptions = computed(() => {
    if (!fieldProps)
      return undefined
    const data = fieldProps.options || fieldProps.treeData
    if (!data)
      return undefined

    // Handle fieldNames normalization
    const { children, label, value } = fieldProps.fieldNames || {}
    if (children || label || value) {
      const traverseFieldKey = (
        _options: SelectOption[],
        type: 'children' | 'label' | 'value',
      ) => {
        if (!_options?.length)
          return
        for (const cur of _options) {
          const fieldKey = type === 'children' ? children : type === 'label' ? label : value
          if (cur[fieldKey] !== undefined) {
            cur[type] = cur[fieldKey]
          }
          if (cur[children])
            traverseFieldKey(cur[children], type)
        }
      }
      if (children)
        traverseFieldKey(data, 'children')
      if (label)
        traverseFieldKey(data, 'label')
      if (value)
        traverseFieldKey(data, 'value')
    }
    return data
  })

  // Merge all option sources
  const options = computed<SelectOption[]>(() => {
    // If request-based and data is loaded, use requestData
    if (props.request && requestData.value !== null) {
      return requestData.value
    }

    // Use valueEnum options if available (and no fieldProps.options/treeData override)
    const base = (defaultFieldOptions.value ?? valueEnumOptions.value) || []

    // Apply keyword filtering
    const opt = base.map((item: any) => {
      if (typeof item === 'string') {
        return { label: item, value: item }
      }
      if (item.children || item.options) {
        const childrenOptions = [
          ...(item.children || []),
          ...(item.options || []),
        ].filter((mapItem: any) => filterByItem(mapItem, keyWords.value))
        return { ...item, children: childrenOptions, options: childrenOptions }
      }
      return item
    })

    // Filter if filterOption is not explicitly false
    if (props.fieldProps?.filterOption === false) {
      return opt
    }

    return opt.filter((item: any) => {
      if (!item)
        return false
      if (!keyWords.value)
        return true
      return filterByItem(item, keyWords.value)
    })
  })

  // Fetch data from request
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const fetchData = async (fetchKeyWords?: string) => {
    keyWords.value = fetchKeyWords

    if (!props.request)
      return

    const debounceMs = props.debounceTime ?? props?.fieldProps?.debounceTime ?? 0

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const executeFetch = async () => {
      loading.value = true
      try {
        const data = await props.request!(
          { ...props.params, keyWords: fetchKeyWords },
          props,
        )
        requestData.value = data || []
      }
      catch {
        requestData.value = []
      }
      finally {
        loading.value = false
      }
    }

    if (debounceMs > 0) {
      debounceTimer = setTimeout(executeFetch, debounceMs)
    }
    else {
      await executeFetch()
    }
  }

  const resetData = () => {
    keyWords.value = undefined
    requestData.value = null
  }

  // Watch params to re-fetch
  watch(
    () => props.params,
    () => {
      if (props.request) {
        fetchData(keyWords.value)
      }
    },
    { deep: true },
  )

  // Watch valueEnum to update options
  watch(
    () => props.valueEnum,
    () => {
      if (props.valueEnum && !props.fieldProps?.options && !props.fieldProps?.treeData) {
        // valueEnum options are computed reactively, no action needed
      }
    },
    { deep: true },
  )

  // Initial fetch if request is provided
  if (props.request) {
    fetchData(props.defaultKeyWords)
  }

  return [loading, options, fetchData, resetData]
}

export { proFieldParsingValueEnumToArray } from './utils'
