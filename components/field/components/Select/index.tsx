import type { SelectProps } from 'antdv-next'
import type { IntlType } from '../../../provider'
import type { Ref, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, ProFieldValueEnumType, RequestOptionsType } from './types'
import { Badge, useConfig } from 'antdv-next'
import { debounce } from 'es-toolkit'
import useSWRV from 'swrv'
import { computed, defineComponent, h, onUnmounted, ref, watch } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSelectLightEdit from './FieldSelectLightEdit'
import FieldSelectRead from './FieldSelectRead'
import FieldSelectSearchEdit from './FieldSelectSearchEdit'

export type { FieldSelectProps, ProFieldRequestData, ProFieldValueEnumType, RequestOptionsType } from './types'

interface FieldFetchFieldProps {
  options?: RequestOptionsType[]
  treeData?: RequestOptionsType[]
  fieldNames?: {
    children?: string
    label?: string
    value?: string
    options?: string
  }
  filterOption?: SelectProps['filterOption']
  debounceTime?: number
}

type FieldSelectFieldProps = SelectProps & FieldFetchFieldProps

type FieldSelectComponentProps = NonNullable<
  ProFieldFC<Omit<FieldSelectProps<FieldSelectFieldProps>, 'className' | 'fieldNames' | 'style'> & {
    className?: string
    fieldNames?: SelectProps['fieldNames']
    cacheForSwr?: boolean
    light?: boolean
  }>['__props']
>

export function objectToMap(value: ProFieldValueEnumType): Map<any, any> {
  if (value instanceof Map)
    return value
  return new Map(Object.entries(value || {}))
}

export function proFieldParsingText(text: any, valueEnumParams: ProFieldValueEnumType): any {
  if (Array.isArray(text))
    return text.map(value => proFieldParsingText(value, valueEnumParams)).join(',')

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

function normalizeFieldNamesOptions(options: RequestOptionsType[] | undefined, fieldNames?: FieldFetchFieldProps['fieldNames']): RequestOptionsType[] | undefined {
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
  props: FieldSelectProps<FieldFetchFieldProps> & {
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

  const swrKey = ref<[string, FieldSelectComponentProps['params'], string | undefined] | null>(null)
  const swr = useSWRV<RequestOptionsType[]>(
    () => props.request ? swrKey.value : null,
    async (_cacheKey: string, params: FieldSelectComponentProps['params'], kw: string | undefined) => {
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
    const fieldProps = props.fieldProps
    const data = props.options || fieldProps?.options || fieldProps?.treeData
    return normalizeFieldNamesOptions(data, fieldProps?.fieldNames)
  }

  const localOptions = computed(() => {
    let base: RequestOptionsType[] = []
    if (props.request && swr.data.value) {
      base = swr.data.value
    }
    else {
      const fieldOptions = getDefaultOptions()
      base = fieldOptions ?? getValueEnumOptions()
    }
    const opt = base.map((item: RequestOptionsType | string) => {
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

    if (props.fieldProps?.filterOption === false)
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

    const debounceMs = props.debounceTime ?? props.fieldProps?.debounceTime ?? 0
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
  options: RequestOptionsType[],
  fieldNames?: FieldFetchFieldProps['fieldNames'],
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

const fieldSelectPropNames = [
  'text',
  'mode',
  'valueEnum',
  'debounceTime',
  'request',
  'options',
  'params',
  'fieldProps',
  'render',
  'formItemRender',
  'emptyText',
  'proFieldKey',
  'defaultKeyWords',
  'cacheForSwr',
  'light',
  'label',
  'variant',
  'id',
  'style',
  'className',
  'lightLabel',
  'labelTrigger',
]

function withFieldSelectDefaults(props: FieldSelectComponentProps): FieldSelectComponentProps {
  return new Proxy(props, {
    get(target, key: string) {
      const value = (target as Record<string, unknown>)[key]
      if (value !== undefined) {
        if ((key === 'light' || key === 'labelTrigger') && value === '')
          return true
        return value
      }
      if (key === 'text')
        return ''
      if (key === 'mode')
        return 'read'
      if (key === 'fieldProps')
        return {}
      if (key === 'emptyText')
        return '-'
      if (key === 'light' || key === 'labelTrigger')
        return false
      return undefined
    },
  }) as FieldSelectComponentProps
}

const FieldSelect = defineComponent({
  name: 'FieldSelect',
  props: fieldSelectPropNames,
  setup(rawProps, { expose }) {
    const props = withFieldSelectDefaults(rawProps as unknown as FieldSelectComponentProps)
    const selectRef = ref<any>(null)
    const [loading, options, fetchData, resetData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])
    const { componentSize } = useConfig()
    const intl: IntlType = {
      locale: 'default',
      getMessage: (_id: string, defaultMessage: string) => defaultMessage,
    }

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
        return FieldSelectRead({
          text: props.text,
          mode: props.mode,
          valueEnum: props.valueEnum,
          optionsValueEnum: optionsValueEnum.value,
          render: props.render,
          fieldProps: props.fieldProps,
          emptyText: props.emptyText,
        })
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
          intl,
          style: props.style,
          className: props.className,
          defaultKeyWords: props.defaultKeyWords,
          inputRef: selectRef,
        }

        if (props.light) {
          return FieldSelectLightEdit({
            ...sharedEditProps,
            lightLabel: props.lightLabel,
            labelTrigger: props.labelTrigger,
            componentSize: componentSize.value ?? 'middle',
          })
        }

        return FieldSelectSearchEdit(sharedEditProps)
      }

      return null
    }
  },
})

export default FieldSelect
