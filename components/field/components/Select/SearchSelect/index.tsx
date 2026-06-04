import type { SelectProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { RequestOptionsType } from '../types'
import { clsx } from '@v-c/util'
import { Select } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'

export interface LabeledValue {
  key?: string
  label: VNodeChild
  value: string | number
}

export type DefaultOptionType = NonNullable<SelectProps['options']>[number]

type KeyLabel = Partial<{
  key: string
  label: any
  value: string | number
}> & RequestOptionsType

export type DataValueType<T> = KeyLabel & T

export type DataValuesType<T> = DataValueType<T> | DataValueType<T>[]

export interface SearchSelectProps<T = Record<string, any>> extends Omit<SelectProps, 'options'> {
  debounceTime?: number
  request?: (params: { query: string }) => Promise<DataValueType<T>[]>
  value?: KeyLabel | KeyLabel[]
  defaultValue?: KeyLabel | KeyLabel[]
  options?: RequestOptionsType[]
  style?: Record<string, any>
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

type SearchSelectMergedProps = SearchSelectProps & {
  options: RequestOptionsType[]
  allowClear: boolean
  disabled: boolean
  loading: boolean
  fetchDataOnSearch: boolean
  autoClearSearchValue: boolean
  searchOnFocus: boolean
  resetAfterSelect: boolean
  showSearch: boolean
  optionFilterProp: string
  optionLabelProp: string
  labelInValue: boolean
}

function getOriginalLabel(item: any, fallbackValue: any): any {
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

function findDataItem(options: RequestOptionsType[], value: any, valueName: string, optionsName: string): any {
  const optionValue = value?.[valueName] ?? value?.value ?? value
  for (const opt of options) {
    const optValue = opt[valueName] ?? opt.value
    if (optValue === optionValue)
      return opt
    const children = opt[optionsName] || opt.options || opt.children
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
  'mode',
  'onSearch',
  'onChange',
  'onFocus',
  'onClear',
  'filterOption',
]

function booleanValue(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined)
    return defaultValue
  return value === '' ? true : !!value
}

function withSearchSelectDefaults(props: SearchSelectProps): SearchSelectMergedProps {
  return new Proxy(props, {
    get(target, key: string) {
      const value = (target as unknown as Record<string, unknown>)[key]
      if (key === 'allowClear' || key === 'fetchDataOnSearch' || key === 'autoClearSearchValue' || key === 'showSearch')
        return booleanValue(value, true)
      if (key === 'disabled' || key === 'loading' || key === 'searchOnFocus' || key === 'resetAfterSelect' || key === 'labelInValue')
        return booleanValue(value, false)
      if (value !== undefined)
        return value
      if (key === 'options')
        return []
      if (key === 'optionFilterProp' || key === 'optionLabelProp')
        return 'label'
      return undefined
    },
  }) as SearchSelectMergedProps
}

const SearchSelect = defineComponent({
  name: 'SearchSelect',
  inheritAttrs: false,
  props: searchSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = withSearchSelectDefaults(rawProps as unknown as SearchSelectProps)
    const selectRef = ref<any>(null)
    const innerSearchValue = ref(props.searchValue ?? props.defaultSearchValue ?? '')

    expose({ selectRef })

    watch(
      () => props.searchValue,
      (value) => {
        if (value !== undefined)
          innerSearchValue.value = value
      },
    )

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
      options: props.fieldNames?.options || 'options',
    }))

    const genOptions = (mapOptions: RequestOptionsType[]): any[] => {
      return (mapOptions || []).map((item, index) => {
        const { className: itemClassName, optionType, ...restItem } = item
        const label = item[fieldNames.value.label] ?? item.text
        const value = item[fieldNames.value.value]
        const itemOptions = item[fieldNames.value.options] ?? item.options ?? item.children ?? []
        const key = value ?? `${label?.toString()}-${index}`

        if (optionType === 'optGroup' || item.options || item.children) {
          return {
            label,
            ...restItem,
            data_title: label,
            title: label,
            key,
            options: genOptions(itemOptions),
            children: genOptions(itemOptions),
          }
        }

        return {
          'title': label,
          ...restItem,
          'data_title': label,
          'value': value ?? index,
          key,
          'data-item': item,
          'className': clsx('ant-pro-filed-search-select-option', itemClassName),
          label,
        }
      })
    }

    const mergedOptions = computed(() => genOptions(props.options))

    const setSearchValue = (value: string) => {
      innerSearchValue.value = value
    }

    const getMergeValue = (value: KeyLabel | KeyLabel[], option: any) => {
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

    return () => {
      const restAttrs = attrs as Partial<SelectProps> & Record<string, unknown>
      const onChange = props.onChange as
        | ((value: any, option: any, ...args: any[]) => void)
        | undefined

      return (
        <Select
          ref={selectRef}
          id={props.id}
          class={props.className}
          style={props.style}
          placeholder={props.placeholder}
          notFoundContent={props.notFoundContent}
          allowClear={props.allowClear}
          autoClearSearchValue={props.autoClearSearchValue}
          disabled={props.disabled}
          loading={props.loading}
          mode={props.mode}
          showSearch={props.showSearch}
          searchValue={innerSearchValue.value}
          optionFilterProp={props.optionFilterProp}
          optionLabelProp={props.optionLabelProp}
          {...restAttrs}
          filterOption={
            props.filterOption === false
              ? false
              : (inputValue: string, option: any) => {
                  const effectiveSearchValue = innerSearchValue.value === '' ? '' : inputValue || innerSearchValue.value
                  if (!effectiveSearchValue)
                    return true
                  if (typeof props.filterOption === 'function') {
                    return props.filterOption(effectiveSearchValue, {
                      ...option,
                      label: option?.data_title,
                    })
                  }
                  return !!(
                    option?.data_title?.toString().toLowerCase().includes(effectiveSearchValue.toLowerCase())
                    || option?.[props.optionFilterProp]?.toString().toLowerCase().includes(effectiveSearchValue.toLowerCase())
                  )
                }
          }
          onClear={() => {
            props.onClear?.()
            props.fetchData?.(undefined)
            if (props.showSearch) {
              props.onSearch?.('')
              setSearchValue('')
            }
          }}
          onSearch={props.showSearch
            ? (value: string) => {
                if (props.fetchDataOnSearch)
                  props.fetchData?.(value)
                props.onSearch?.(value)
                setSearchValue(value)
              }
            : undefined}
          onChange={(value: any, optionList: any, ...rest: any[]) => {
            if (props.showSearch && props.autoClearSearchValue) {
              props.fetchData?.(undefined)
              props.onSearch?.('')
              setSearchValue('')
            }

            if (!props.labelInValue) {
              onChange?.(value, optionList, ...rest)
              return
            }

            if (props.mode !== 'multiple' && !Array.isArray(optionList)) {
              const dataItem = optionList?.['data-item']
              const foundDataItem = dataItem || findDataItem(props.options, value, fieldNames.value.value, fieldNames.value.options)
              if (!value || !foundDataItem) {
                onChange?.(value ? { ...value, label: getOriginalLabel(foundDataItem, value) } : value, optionList, ...rest)
                return
              }
              onChange?.(
                {
                  ...value,
                  ...foundDataItem,
                  label: getOriginalLabel(foundDataItem, value),
                },
                optionList,
                ...rest,
              )
              return
            }

            onChange?.(getMergeValue(value, optionList), optionList, ...rest)
            if (props.resetAfterSelect)
              props.resetData?.()
          }}
          onFocus={(event: FocusEvent) => {
            if (props.searchOnFocus) {
              props.fetchData?.(undefined)
              if (props.showSearch) {
                props.onSearch?.('')
                setSearchValue('')
              }
            }
            props.onFocus?.(event)
          }}
          options={mergedOptions.value}
        />
      )
    }
  },
})

export default SearchSelect
