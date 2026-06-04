import type { PropType, Ref, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldSelectProps, ProFieldValueEnumType, RequestOptionsType } from './types'
import { Badge } from 'antdv-next'
import { debounce } from 'es-toolkit'
import useSWRV from 'swrv'
import { computed, defineComponent, h, onUnmounted, ref, watch } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSelectLightEdit from './FieldSelectLightEdit'
import FieldSelectRead from './FieldSelectRead'
import FieldSelectSearchEdit from './FieldSelectSearchEdit'

export type { FieldSelectProps, ProFieldRequestData, ProFieldValueEnumType, RequestOptionsType } from './types'

export function objectToMap(value: ProFieldValueEnumType): Map<any, any> {
  if (value instanceof Map)
    return value
  return new Map(Object.entries(value || {}))
}

export function proFieldParsingText(text: any, valueEnumParams: ProFieldValueEnumType): any {
  if (Array.isArray(text))
    return text.map(value => proFieldParsingText(value, valueEnumParams)).join(', ')

  const valueEnum = objectToMap(valueEnumParams)
  if (!valueEnum.has(text) && !valueEnum.has(`${text}`))
    return text?.label ?? text

  const domText = valueEnum.get(text) || valueEnum.get(`${text}`)
  if (!domText)
    return text?.label ?? text

  if (typeof domText === 'object') {
    if (domText.status) {
      return h(Badge, {
        status: String(domText.status).toLowerCase() as any,
        text: domText.text || domText.label,
      })
    }
    if (domText.color) {
      return h(Badge, {
        color: domText.color,
        text: domText.text || domText.label,
      })
    }
    return domText.text || domText.label || domText
  }

  return domText
}

export function proFieldParsingValueEnumToArray(valueEnumParams: ProFieldValueEnumType): RequestOptionsType[] {
  const enumArray: RequestOptionsType[] = []
  const valueEnum = objectToMap(valueEnumParams)

  valueEnum.forEach((_, key) => {
    const value = valueEnum.get(key) || valueEnum.get(`${key}`)
    if (value == null)
      return

    if (typeof value === 'object' && value?.text) {
      enumArray.push({
        text: value.text,
        value: key,
        label: value.text,
        disabled: value.disabled,
      })
      return
    }

    enumArray.push({
      text: value as VNodeChild,
      value: key,
      label: value as VNodeChild,
    })
  })

  return enumArray
}

function filterByItem(item: RequestOptionsType, keyWords?: string): boolean {
  if (!keyWords)
    return true

  const keyword = keyWords.toLowerCase()
  if (
    item?.label?.toString().toLowerCase().includes(keyword)
    || item?.text?.toString().toLowerCase().includes(keyword)
    || item?.value?.toString().toLowerCase().includes(keyword)
    || item?.data_title?.toString().toLowerCase().includes(keyword)
  ) {
    return true
  }

  if (item.children || item.options) {
    return [...(item.children || []), ...(item.options || [])].some(mapItem =>
      filterByItem(mapItem, keyWords),
    )
  }

  return false
}

function getOptionsFromValueEnum(coverValueEnum: ProFieldValueEnumType): RequestOptionsType[] {
  return proFieldParsingValueEnumToArray(objectToMap(coverValueEnum)).map(
    ({ value, text, ...rest }) => ({
      ...rest,
      value,
      key: value,
      label: text,
    }),
  )
}

function normalizeFieldNamesOptions(options: any[] | undefined, fieldNames?: Record<string, string>): RequestOptionsType[] | undefined {
  if (!options)
    return undefined

  const { children, label, value, options: optionsName } = fieldNames || {}
  return options.map((item: any) => {
    if (typeof item !== 'object' || item === null)
      return item

    const normalized = { ...item }
    const childrenKey = children || optionsName
    if (label && normalized[label] !== undefined)
      normalized.label = normalized[label]
    if (value && normalized[value] !== undefined)
      normalized.value = normalized[value]
    if (childrenKey && normalized[childrenKey])
      normalized.children = normalizeFieldNamesOptions(normalized[childrenKey], fieldNames)
    if (optionsName && normalized[optionsName])
      normalized.options = normalizeFieldNamesOptions(normalized[optionsName], fieldNames)
    return normalized
  })
}

let fieldFetchCacheSeed = 0
const MAX_TIMER_DEDUPING_INTERVAL = 2_147_483_647

export function useFieldFetchData(
  props: FieldSelectProps & {
    proFieldKey?: string | number
    defaultKeyWords?: string
    cacheForSwr?: boolean
  },
): [Ref<boolean>, Ref<RequestOptionsType[]>, (keyWord?: string) => void, () => void] {
  const keyWords = ref<string | undefined>(props.defaultKeyWords)
  let debouncedFetch: ReturnType<typeof debounce<(runner: () => void) => void>> | undefined
  let debounceMsCache: number | undefined
  const cacheKey = props.proFieldKey != null
    ? props.proFieldKey.toString()
    : props.request
      ? `field-select-${++fieldFetchCacheSeed}`
      : 'no-fetch'

  const swrKey = ref<[string, any, string | undefined] | null>(null)
  const swr = useSWRV<RequestOptionsType[]>(
    () => props.request ? swrKey.value : null,
    async (_cacheKey: string, params: Record<string, any> | undefined, kw: string | undefined) => {
      const data = await props.request!(
        { ...(params || {}), keyWords: kw },
        props,
      )
      return data || []
    },
    {
      dedupingInterval: props.cacheForSwr ? MAX_TIMER_DEDUPING_INTERVAL : 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  const loading = computed(() => props.request ? swr.isValidating.value : false) as Ref<boolean>

  const getValueEnumOptions = () => {
    if (!props.valueEnum)
      return []
    return getOptionsFromValueEnum(props.valueEnum)
  }

  const getDefaultOptions = () => {
    const fieldProps = props.fieldProps as Record<string, any> | undefined
    const data = fieldProps?.options || fieldProps?.treeData
    return normalizeFieldNamesOptions(data, fieldProps?.fieldNames)
  }

  const localOptions = computed(() => {
    let base: any[] = []
    if (props.request && swr.data.value) {
      base = swr.data.value as any[]
    }
    else {
      const fieldOptions = getDefaultOptions()
      base = fieldOptions ? fieldOptions as any[] : getValueEnumOptions() as any[]
    }
    const opt = base.map((item: any) => {
      if (typeof item === 'string')
        return { label: item, value: item }

      if (item?.children || item?.options) {
        const childrenOptions = [
          ...(item.children || []),
          ...(item.options || []),
        ].filter((mapItem: RequestOptionsType) => filterByItem(mapItem, keyWords.value))
        return { ...item, children: childrenOptions, options: childrenOptions }
      }

      return item
    })

    if ((props.fieldProps as Record<string, any> | undefined)?.filterOption === false)
      return opt as RequestOptionsType[]

    return opt.filter((item: RequestOptionsType) => {
      if (!item)
        return false
      if (!keyWords.value)
        return true
      return filterByItem(item, keyWords.value)
    }) as RequestOptionsType[]
  }) as Ref<RequestOptionsType[]>

  const fetchData = (fetchKeyWords?: string) => {
    keyWords.value = fetchKeyWords

    if (!props.request)
      return

    const executeFetch = () => {
      swrKey.value = [cacheKey, props.params, fetchKeyWords]
    }

    const debounceMs = props.debounceTime ?? (props.fieldProps as Record<string, any> | undefined)?.debounceTime ?? 0
    if (debounceMs > 0) {
      if (!debouncedFetch || debounceMsCache !== debounceMs) {
        debouncedFetch?.cancel()
        debounceMsCache = debounceMs
        debouncedFetch = debounce((runner: () => void) => runner(), debounceMs)
      }
      debouncedFetch(() => {
        void executeFetch()
      })
      return
    }

    debouncedFetch?.cancel()
    void executeFetch()
  }

  const resetData = () => {
    keyWords.value = undefined
    void swr.mutate(() => Promise.resolve([]), { shouldRetryOnError: false })
  }

  watch(
    () => props.params,
    () => {
      if (props.request)
        fetchData(keyWords.value)
    },
    { deep: true },
  )

  watch(
    () => props.request,
    () => {
      if (props.request)
        fetchData(keyWords.value)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    debouncedFetch?.cancel()
  })

  return [loading, localOptions, fetchData, resetData]
}

function buildOptionsValueEnum(
  options: any[],
  fieldNames?: Record<string, string>,
): Map<any, any> | undefined {
  if (!options?.length)
    return undefined

  const {
    value: valuePropsName = 'value',
    label: labelPropsName = 'label',
    options: optionsPropsName = 'options',
  } = fieldNames || {}

  const valuesMap = new Map()

  const traverseOptions = (_options: any[]) => {
    if (!_options?.length)
      return valuesMap
    for (const cur of _options) {
      valuesMap.set(cur[valuePropsName], cur[labelPropsName])
      traverseOptions(cur[optionsPropsName] || cur.children)
    }
    return valuesMap
  }

  return traverseOptions(options)
}

export default defineComponent({
  name: 'FieldSelect',
  props: {
    text: { type: null as unknown as PropType<any>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    request: { type: Function as PropType<FieldSelectProps['request']>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    render: { type: Function as PropType<FieldSelectProps['render']>, default: undefined },
    formItemRender: { type: Function as PropType<FieldSelectProps['formItemRender']>, default: undefined },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    proFieldKey: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
    light: { type: Boolean, default: false },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    id: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    className: { type: String, default: undefined },
    lightLabel: { type: Object as PropType<any>, default: undefined },
    labelTrigger: { type: Boolean, default: false },
  },
  setup(props, { expose }) {
    const selectRef = ref<any>(null)
    const [loading, options, fetchData, resetData] = useFieldFetchData(props)

    expose({
      fetchData,
      selectRef,
    })

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldSelectRead
            text={props.text}
            mode={props.mode}
            valueEnum={props.valueEnum}
            optionsValueEnum={optionsValueEnum.value}
            render={props.render}
            fieldProps={props.fieldProps}
            emptyText={props.emptyText}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const sharedEditProps = {
          text: props.text,
          mode: props.mode,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          loading: loading.value,
          options: options.value,
          fetchData,
          resetData,
          id: props.id,
          label: props.label,
          variant: props.variant,
          style: props.style,
          className: props.className,
          defaultKeyWords: props.defaultKeyWords,
          selectRef,
        }

        if (props.light) {
          return (
            <FieldSelectLightEdit
              {...sharedEditProps}
              lightLabel={props.lightLabel}
              labelTrigger={props.labelTrigger}
            />
          )
        }

        return <FieldSelectSearchEdit {...sharedEditProps} />
      }

      return null
    }
  },
})
