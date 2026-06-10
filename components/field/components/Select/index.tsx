import type { Select, SelectProps } from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type { ProSchemaValueEnumMap } from '../../../utils/typing'
import type { ProFieldFC } from '../../types'
import type { LightSelectExpose } from './LightSelect'
import type { SearchSelectExpose } from './SearchSelect'
import type { FieldSelectProps, ProFieldValueEnumType, RequestOptionsType } from './types'
import { useConfig } from 'antdv-next'
import { debounce } from 'es-toolkit'
import useSWRV from 'swrv'
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue'
import { useIntl, useProProviderSWRVContext } from '../../../provider'
import { objectToMap } from '../../../utils'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSelectLightEdit from './FieldSelectLightEdit'
import FieldSelectRead from './FieldSelectRead'
import FieldSelectSearchEdit from './FieldSelectSearchEdit'

export type { FieldSelectProps } from './types'

type FieldSelectInstance = InstanceType<typeof Select>
export type FieldSelectExpose = Partial<FieldSelectInstance> & {
  fetchData: (keyWord?: string) => void
}

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

type FieldSelectBaseProps = FieldSelectProps<FieldSelectFieldProps> & {
  fieldNames?: SelectProps['fieldNames']
  style?: CSSProperties
  className?: string
}

type FieldSelectComponentProps = NonNullable<
  ProFieldFC<FieldSelectBaseProps & {
    cacheForSwr?: boolean
    light?: boolean
  }>['__props']
>

export function proFieldParsingValueEnumToArray(valueEnumParams: ProFieldValueEnumType): RequestOptionsType[] {
  const enumArray: RequestOptionsType[] = []
  const valueEnum = objectToMap(valueEnumParams)

  valueEnum.forEach((_, key) => {
    const value = (valueEnum.get(key) || valueEnum.get(`${key}`)) as {
      text: VNodeChild
      disabled?: boolean
    }
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
      text: value as unknown as VNodeChild,
      value: key,
      label: value as unknown as VNodeChild,
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
    || item?.value?.toString().toLowerCase().includes(keyword)
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
  const providerSWRVContext = useProProviderSWRVContext()
  let debouncedFetch: ReturnType<typeof debounce<(runner: () => void) => void>> | undefined
  let debounceMsCache: number | undefined
  const cacheKey = props.proFieldKey != null
    ? `${providerSWRVContext?.key || 'default'}-${props.proFieldKey.toString()}`
    : props.request
      ? `${providerSWRVContext?.key || 'default'}-field-select-${++fieldFetchCacheSeed}`
      : 'no-fetch'
  const swrvConfig = {
    ...(providerSWRVContext ? { cache: providerSWRVContext.cache } : {}),
    dedupingInterval: props.cacheForSwr ? MAX_TIMER_DEDUPING_INTERVAL : 2000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  }

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
    swrvConfig,
  )

  const loading = computed(() => props.request ? swr.isValidating.value : false) as Ref<boolean>

  const getValueEnumOptions = () => {
    if (!props.valueEnum)
      return []
    return getOptionsFromValueEnum(props.valueEnum)
  }

  const getDefaultOptions = () => {
    const fieldProps = props.fieldProps
    const data = fieldProps?.options || fieldProps?.treeData || props.options
    if (!data || !fieldProps?.fieldNames)
      return data

    const { children, label, value } = fieldProps.fieldNames
    const traverseFieldKey = (_options: RequestOptionsType[] | undefined, type: 'children' | 'label' | 'value') => {
      if (!_options?.length)
        return

      const length = _options.length
      let i = 0
      while (i < length) {
        const cur = _options[i++]!
        const fromKey = type === 'children' ? children : type === 'label' ? label : value
        const mappedChildren = children ? cur[children] as RequestOptionsType[] | undefined : undefined
        const mappedLabel = label ? cur[label] : undefined
        const mappedValue = value ? cur[value] : undefined
        if (!fromKey)
          continue
        if (mappedChildren || mappedLabel || mappedValue) {
          if (type === 'children') {
            cur.children = cur[fromKey] as RequestOptionsType[] | undefined
          }
          else if (type === 'label') {
            cur.label = cur[fromKey] as VNodeChild
          }
          else {
            cur.value = cur[fromKey] as string | number | boolean | undefined
          }
          traverseFieldKey(mappedChildren, type)
        }
      }
    }

    if (children)
      traverseFieldKey(data, 'children')
    if (label)
      traverseFieldKey(data, 'label')
    if (value)
      traverseFieldKey(data, 'value')

    return data
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

const fieldSelectPropNames = [
  'text',
  'mode',
  'valueEnum',
  'debounceTime',
  'request',
  'options',
  'params',
  'fieldProps',
  'proFieldKey',
  'defaultKeyWords',
  'cacheForSwr',
  'light',
  'label',
  'variant',
  'id',
  'lightLabel',
  'labelTrigger',
]

function normalizeBoolean(value: unknown): boolean {
  return value === '' || value === true
}

const FieldSelect = defineComponent({
  name: 'FieldSelect',
  inheritAttrs: false,
  props: fieldSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = rawProps as FieldSelectComponentProps
    const inheritedProps = attrs as Partial<FieldSelectComponentProps>
    const selectRef = ref<SearchSelectExpose | LightSelectExpose | null>(null)
    const [loading, options, fetchData, resetData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])
    const { componentSize } = useConfig()
    const intl = useIntl()
    const getInnerSelectInstance = (): FieldSelectInstance | null => {
      const exposed = selectRef.value
      return exposed?.selectRef?.value ?? null
    }

    expose(
      new Proxy({ fetchData } as FieldSelectExpose, {
        get(target, key: string) {
          if (key in target)
            return target[key as keyof FieldSelectExpose]
          return getInnerSelectInstance()?.[key as keyof FieldSelectInstance]
        },
        has(target, key: string) {
          return key in target || (!!getInnerSelectInstance() && key in getInnerSelectInstance()!)
        },
      }),
    )

    const optionsValueEnum = computed(() => {
      const mode = props.mode ?? 'read'
      const fieldProps = props.fieldProps ?? {}

      if (!isProFieldReadMode(mode))
        return undefined

      const {
        label: labelPropsName = 'label',
        value: valuePropsName = 'value',
        options: optionsPropsName = 'options',
      } = fieldProps.fieldNames || {}

      const valuesMap: ProSchemaValueEnumMap = new Map()

      const traverseOptions = (_options?: RequestOptionsType[]): ProSchemaValueEnumMap => {
        if (!_options?.length) {
          return valuesMap
        }
        const length = _options.length
        let i = 0
        while (i < length) {
          const cur = _options[i++]!
          valuesMap.set(
            cur[valuePropsName] as string | number | boolean,
            cur[labelPropsName] as VNodeChild,
          )
          traverseOptions(cur[optionsPropsName] as RequestOptionsType[] | undefined)
        }
        return valuesMap
      }

      return traverseOptions(options.value)
    })

    return () => {
      const mode = props.mode ?? 'read'
      const fieldProps = props.fieldProps ?? {}
      const light = normalizeBoolean(props.light)
      const labelTrigger = normalizeBoolean(props.labelTrigger)
      const text = props.text ?? ''
      const emptyText = inheritedProps.emptyText ?? '-'

      if (isProFieldReadMode(mode)) {
        return FieldSelectRead({
          text,
          mode,
          valueEnum: props.valueEnum,
          optionsValueEnum: optionsValueEnum.value,
          render: inheritedProps.render,
          fieldProps,
          emptyText,
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        const sharedEditProps = {
          text,
          mode,
          formItemRender: inheritedProps.formItemRender,
          fieldProps,
          loading: loading.value,
          options: options.value,
          fetchData,
          resetData,
          id: props.id,
          label: props.label,
          variant: props.variant,
          intl,
          style: inheritedProps.style,
          className: inheritedProps.className,
          defaultKeyWords: props.defaultKeyWords,
          inputRef: selectRef as Ref<SearchSelectExpose | null>,
        }

        if (light) {
          return FieldSelectLightEdit({
            ...sharedEditProps,
            lightLabel: props.lightLabel,
            labelTrigger,
            componentSize: componentSize.value ?? 'middle',
            inputRef: selectRef as Ref<LightSelectExpose | null>,
          })
        }

        return FieldSelectSearchEdit(sharedEditProps)
      }

      return null
    }
  },
})

export default FieldSelect as unknown as ProFieldFC<FieldSelectBaseProps & {
  cacheForSwr?: boolean
  light?: boolean
}>
