import type { PropType } from 'vue'
import type { RequestOptionsType } from '../types'
import { clsx } from '@v-c/util'
import { Select } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'

type KeyLabel = Partial<{
  key: string
  label: any
  value: string | number
}> & RequestOptionsType

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

export default defineComponent({
  name: 'SearchSelect',
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<RequestOptionsType[]>, default: () => [] },
    id: { type: String, default: undefined },
    label: { type: null as unknown as PropType<any>, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    placeholder: { type: null as unknown as PropType<any>, default: undefined },
    notFoundContent: { type: null as unknown as PropType<any>, default: undefined },
    allowClear: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    resetData: { type: Function as PropType<() => void>, default: undefined },
    fetchDataOnSearch: { type: Boolean, default: true },
    defaultSearchValue: { type: String, default: undefined },
    searchValue: { type: String, default: undefined },
    autoClearSearchValue: { type: Boolean, default: true },
    searchOnFocus: { type: Boolean, default: false },
    resetAfterSelect: { type: Boolean, default: false },
    showSearch: { type: Boolean, default: true },
    optionFilterProp: { type: String, default: 'label' },
    optionLabelProp: { type: String, default: 'label' },
    labelInValue: { type: Boolean, default: false },
    fieldNames: { type: Object as PropType<Record<string, string>>, default: undefined },
    mode: { type: String as PropType<'multiple' | 'tags'>, default: undefined },
    onSearch: { type: Function as PropType<(value: string) => void>, default: undefined },
    onChange: { type: Function as PropType<(value: any, option: any, ...args: any[]) => void>, default: undefined },
    onFocus: { type: Function as PropType<(event: FocusEvent) => void>, default: undefined },
    onClear: { type: Function as PropType<() => void>, default: undefined },
    filterOption: { type: [Boolean, Function] as PropType<boolean | ((input: string, option: any) => boolean)>, default: undefined },
  },
  setup(props, { attrs, expose }) {
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
          title: label,
          ...restItem,
          data_title: label,
          value: value ?? index,
          key,
          'data-item': item,
          className: clsx('ant-pro-filed-search-select-option', itemClassName),
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
      const restAttrs = attrs as Record<string, any>

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
              props.onChange?.(value, optionList, ...rest)
              return
            }

            if (props.mode !== 'multiple' && !Array.isArray(optionList)) {
              const dataItem = optionList?.['data-item']
              const foundDataItem = dataItem || findDataItem(props.options, value, fieldNames.value.value, fieldNames.value.options)
              if (!value || !foundDataItem) {
                props.onChange?.(value ? { ...value, label: getOriginalLabel(foundDataItem, value) } : value, optionList, ...rest)
                return
              }
              props.onChange?.(
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

            props.onChange?.(getMergeValue(value, optionList), optionList, ...rest)
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
