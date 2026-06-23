import type { SelectProps } from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type { RequestOptionsType } from '../types'
import { clsx } from '@v-c/util'
import { Select } from 'antdv-next'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import { nanoid } from '../../../../utils'

export interface LabeledValue {
  key?: string
  label: VNodeChild
  value: string | number
}

export type DefaultOptionType = NonNullable<SelectProps['options']>[number]
type SelectInstance = InstanceType<typeof Select>
export type SearchSelectExpose = {
  selectRef: Ref<SelectInstance | null>
}
type SelectOnChange = NonNullable<SelectProps['onChange']>
type SelectOnChangeValue = Parameters<SelectOnChange>[0]
type SelectOnChangeOption = Parameters<SelectOnChange>[1]
type SelectFilterOption = Exclude<SelectProps['filterOption'], boolean | undefined>
type SelectFilterOptionOption = Parameters<SelectFilterOption>[1]
type KeyValue = string | number | boolean
type ValueLike = KeyValue | KeyLabel | undefined

type SearchOption = RequestOptionsType & {
  data_title?: VNodeChild
  title?: VNodeChild
  children?: SearchOption[]
  options?: SearchOption[]
  'data-item'?: RequestOptionsType
  className?: string
  key?: string | number | boolean
}

export type KeyLabel = Partial<{
  key: string
  label: VNodeChild
  value: KeyValue
}> & RequestOptionsType

export type DataValueType<T> = KeyLabel & T

export type DataValuesType<T> = DataValueType<T> | DataValueType<T>[]

export interface SearchSelectProps<T = Record<string, unknown>> extends Omit<SelectProps, 'options'> {
  debounceTime?: number
  request?: (params: { query: string }) => Promise<DataValueType<T>[]>
  value?: KeyLabel | KeyLabel[]
  defaultValue?: KeyLabel | KeyLabel[]
  options?: RequestOptionsType[]
  style?: CSSProperties
  className?: string
  label?: VNodeChild
  placeholder?: SelectProps['placeholder']
  notFoundContent?: SelectProps['notFoundContent']
  searchOnFocus?: boolean
  resetAfterSelect?: boolean
  prefixCls?: string
  fetchData: (keyWord?: string) => void
  resetData: () => void
  fetchDataOnSearch?: boolean
  defaultSearchValue?: string
}

type SearchSelectAttrs = Partial<SelectProps> & {
  autoFocus?: boolean | ''
}

function getOriginalLabel(item?: Partial<RequestOptionsType>, fallbackValue?: Partial<KeyLabel>): VNodeChild {
  if (typeof item?.label === 'string')
    return item.label
  if (typeof item?.text === 'string')
    return item.text
  if (item?.label)
    return String(item.label)
  if (item?.text)
    return String(item.text)
  return fallbackValue?.label ?? ''
}

function isKeyLabel(value: ValueLike): value is KeyLabel {
  return !!value && typeof value === 'object'
}

function findDataItem(options: RequestOptionsType[], value: ValueLike, valueName: string, optionsName: string): RequestOptionsType | undefined {
  const optionValue = isKeyLabel(value)
    ? (value[valueName] ?? value.value)
    : value
  for (const opt of options) {
    const optValue = opt[valueName] ?? opt.value
    if (optValue === optionValue)
      return opt
    const children = (opt[optionsName] as RequestOptionsType[] | undefined) || opt.options || opt.children
    if (children) {
      const found = findDataItem(children, value, valueName, optionsName)
      if (found)
        return found
    }
  }
  return undefined
}

const searchSelectPropNames = [
  'options',
  'id',
  'label',
  'className',
  'style',
  'placeholder',
  'notFoundContent',
  'allowClear',
  'disabled',
  'loading',
  'fetchData',
  'resetData',
  'fetchDataOnSearch',
  'defaultSearchValue',
  'searchValue',
  'autoClearSearchValue',
  'searchOnFocus',
  'resetAfterSelect',
  'showSearch',
  'optionFilterProp',
  'optionLabelProp',
  'labelInValue',
  'fieldNames',
  'prefixCls',
  'mode',
  'onSearch',
  'onChange',
  'onFocus',
  'onClear',
  'filterOption',
]

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined)
    return defaultValue
  return value === '' ? true : !!value
}

const SearchSelect = defineComponent<SearchSelectProps>({
  name: 'SearchSelect',
  inheritAttrs: false,
  props: searchSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = rawProps
    const selectAttrs = attrs as SearchSelectAttrs
    const selectRef = ref<SelectInstance | null>(null)
    const searchValue = ref(props.searchValue ?? props.defaultSearchValue ?? '')
    const prefixCls = useProPrefixCls('pro-filed-search-select', computed(() => props.prefixCls))

    expose({ selectRef } satisfies SearchSelectExpose)

    watch(
      () => props.searchValue,
      (value) => {
        if (value !== undefined)
          searchValue.value = value
      },
    )

    onMounted(() => {
      if (normalizeBoolean(selectAttrs.autoFocus, false))
        (selectRef.value as { focus?: () => void } | null)?.focus?.()
    })

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
      options: props.fieldNames?.options || 'options',
    }))

    const sourceOptions = computed(() => props.options ?? [])

    const getMergeValue = (value: KeyLabel | KeyLabel[], option: SelectOnChangeOption) => {
      if (Array.isArray(value) && Array.isArray(option) && value.length > 0) {
        return value.map((item, index) => {
          const optionItem = option[index]
          const dataItem = optionItem?.['data-item']
          const originalLabel = getOriginalLabel(dataItem, item)
          return {
            ...(dataItem || {}),
            ...item,
            label: originalLabel || item.label,
          }
        })
      }
      return []
    }

    const genOptions = (mapOptions: RequestOptionsType[]): SearchOption[] => {
      return mapOptions.map((item, index) => {
        const { className: itemClassName, optionType, ...restItem } = item
        const label = item[fieldNames.value.label] ?? item.text
        const value = item[fieldNames.value.value]
        const itemOptions = (item[fieldNames.value.options] as RequestOptionsType[] | undefined) ?? item.options ?? []

        if (optionType === 'optGroup' || item.options) {
          return {
            label,
            ...restItem,
            data_title: label,
            title: label,
            key: value ?? `${label?.toString()}-${index}-${nanoid()}`,
            children: genOptions(itemOptions),
          } as SearchOption
        }

        return {
          title: label,
          ...restItem,
          data_title: label,
          value: value ?? index,
          key: value ?? `${label?.toString()}-${index}-${nanoid()}`,
          'data-item': item,
          className: clsx(`${prefixCls.value}-option`, itemClassName),
          label,
        } as SearchOption
      })
    }

    const mergedOptions = computed(() => genOptions(sourceOptions.value))

    return () => {
      const allowClear = normalizeBoolean(props.allowClear, true)
      const autoClearSearchValue = normalizeBoolean(props.autoClearSearchValue, true)
      const disabled = normalizeBoolean(props.disabled, false)
      const fetchDataOnSearch = normalizeBoolean(props.fetchDataOnSearch, true)
      const labelInValue = normalizeBoolean(props.labelInValue, false)
      const loading = normalizeBoolean(props.loading, false)
      const optionFilterProp = props.optionFilterProp ?? 'label'
      const optionLabelProp = props.optionLabelProp ?? 'label'
      const resetAfterSelect = normalizeBoolean(props.resetAfterSelect, false)
      const searchOnFocus = normalizeBoolean(props.searchOnFocus, false)
      const showSearch = normalizeBoolean(props.showSearch, false)
      const onChange = props.onChange as ((value: SelectOnChangeValue, option: SelectOnChangeOption, ...args: unknown[]) => void) | undefined
      const classString = clsx(prefixCls.value, props.className, {
        [`${prefixCls.value}-disabled`]: disabled,
      })

      return (
        <Select
          ref={selectRef}
          id={props.id}
          class={classString}
          style={props.style}
          placeholder={props.placeholder}
          notFoundContent={props.notFoundContent}
          allowClear={allowClear}
          autoClearSearchValue={autoClearSearchValue}
          disabled={disabled}
          loading={loading}
          mode={props.mode}
          showSearch={showSearch}
          searchValue={searchValue.value}
          optionFilterProp={optionFilterProp}
          optionLabelProp={optionLabelProp}
          {...selectAttrs}
          filterOption={
            props.filterOption === false
              ? false
              : (inputValue: string, option: SelectFilterOptionOption) => {
                  const searchOption = option as SearchOption | undefined
                  const effectiveSearchValue = searchValue.value === '' ? '' : inputValue || searchValue.value
                  if (!effectiveSearchValue)
                    return true
                  if (typeof props.filterOption === 'function') {
                    return props.filterOption(effectiveSearchValue, {
                      ...searchOption,
                      label: searchOption?.data_title,
                    })
                  }
                  return !!(
                    searchOption?.data_title?.toString().toLowerCase().includes(effectiveSearchValue.toLowerCase())
                    || searchOption?.[optionFilterProp]?.toString().toLowerCase().includes(effectiveSearchValue.toLowerCase())
                  )
                }
          }
          onClear={() => {
            props.onClear?.()
            props.fetchData?.(undefined)
            if (showSearch) {
              props.onSearch?.('')
              searchValue.value = ''
            }
          }}
          onSearch={showSearch
            ? (value: string) => {
                if (fetchDataOnSearch)
                  props.fetchData?.(value)
                props.onSearch?.(value)
                searchValue.value = value
              }
            : undefined}
          onChange={(value: SelectOnChangeValue, optionList: SelectOnChangeOption, ...rest: unknown[]) => {
            if (showSearch && autoClearSearchValue) {
              props.fetchData?.(undefined)
              props.onSearch?.('')
              searchValue.value = ''
            }

            if (!labelInValue) {
              onChange?.(value, optionList, ...rest)
              return
            }

            if (props.mode !== 'multiple' && !Array.isArray(optionList)) {
              let dataItem = optionList?.['data-item']
              let foundDataItem = dataItem

              if (!foundDataItem && value) {
                foundDataItem = findDataItem(sourceOptions.value, value, fieldNames.value.value, fieldNames.value.options)
              }

              if (!value || !foundDataItem || !isKeyLabel(value)) {
                const changedValue = value && isKeyLabel(value)
                  ? {
                      ...value,
                      label: getOriginalLabel(foundDataItem, value),
                    }
                  : value
                onChange?.(changedValue, optionList, ...rest)
              }
              else {
                onChange?.(
                  {
                    ...value,
                    ...foundDataItem,
                    label: getOriginalLabel(foundDataItem, value),
                  },
                  optionList,
                  ...rest,
                )
              }
              return
            }

            onChange?.(getMergeValue(value as KeyLabel | KeyLabel[], optionList), optionList, ...rest)
            if (resetAfterSelect)
              props.resetData?.()
          }}
          onFocus={(event: FocusEvent) => {
            if (searchOnFocus) {
              props.fetchData?.(undefined)
              if (showSearch) {
                props.onSearch?.('')
                searchValue.value = ''
              }
            }
            props.onFocus?.(event)
          }}
          options={mergedOptions.value as DefaultOptionType[]}
        />
      )
    }
  },
})

export default SearchSelect
