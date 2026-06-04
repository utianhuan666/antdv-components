import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'
import type { TreeSelectFieldProps } from './types'
import { omit } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldTreeSelectEdit from './FieldTreeSelectEdit'
import FieldTreeSelectLightEdit from './FieldTreeSelectLightEdit'
import FieldTreeSelectRead from './FieldTreeSelectRead'

export type { FieldTreeSelectProps, TreeSelectFieldProps } from './types'

function omitTreeData(fieldProps: TreeSelectFieldProps | undefined) {
  const {
    onClear,
    onChange,
    onBlur,
    showSearch,
    fetchDataOnSearch,
    onSearch,
    autoClearSearchValue,
    searchValue,
  } = fieldProps || {}
  return {
    fieldProps: omit(fieldProps || {}, [
      'treeData',
      'onClear',
      'onChange',
      'onBlur',
      'showSearch',
      'fetchDataOnSearch',
      'onSearch',
      'autoClearSearchValue',
      'searchValue',
    ]),
    onClear,
    onChange,
    onBlur,
    showSearch,
    fetchDataOnSearch,
    onSearch,
    autoClearSearchValue,
    searchValue,
  }
}

function buildTreeOptionsValueEnum(
  options: any[],
  fieldNames?: Record<string, string>,
): Map<any, any> | undefined {
  if (!options?.length)
    return undefined

  const {
    value: valueName = 'value',
    label: labelName = 'label',
    children: childrenName = 'children',
  } = fieldNames || {}
  const valuesMap = new Map()
  const traverse = (opts: any[]) => {
    for (const cur of opts) {
      valuesMap.set(cur[valueName], cur[labelName])
      if (cur[childrenName])
        traverse(cur[childrenName])
    }
  }
  traverse(options)
  return valuesMap
}

export default defineComponent({
  name: 'FieldTreeSelect',
  props: {
    text: { type: null as unknown as PropType<any>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    fieldProps: { type: Object as PropType<TreeSelectFieldProps>, default: () => ({}) },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    light: { type: Boolean, default: false },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    proFieldKey: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
  },
  setup(props, { expose }) {
    const treeSelectRef = ref<any>(null)
    const [loading, options, fetchData] = useFieldFetchData({
      ...props,
      defaultKeyWords: props.fieldProps?.searchValue ?? props.defaultKeyWords,
    })
    const open = ref(false)
    const searchValue = ref<string | undefined>(props.fieldProps?.searchValue)

    expose({
      fetchData,
      treeSelectRef,
    })

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildTreeOptionsValueEnum(options.value, props.fieldProps?.fieldNames as Record<string, string> | undefined)
    })

    return () => {
      const {
        fieldProps,
        onClear,
        onChange,
        onBlur,
        showSearch,
        fetchDataOnSearch,
        onSearch,
        autoClearSearchValue,
        searchValue: propsSearchValue,
      } = omitTreeData(props.fieldProps)

      const showSearchConfig = typeof showSearch === 'object' ? showSearch : {}
      const mergedOnSearch = showSearchConfig?.onSearch ?? onSearch
      const mergedAutoClearSearchValue = showSearchConfig?.autoClearSearchValue ?? autoClearSearchValue
      const mergedSearchValue = showSearchConfig?.searchValue ?? propsSearchValue ?? searchValue.value

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldTreeSelectRead
            text={props.text}
            mode={props.mode}
            valueEnum={props.valueEnum}
            optionsValueEnum={optionsValueEnum.value}
            options={options.value}
            render={props.render}
            fieldProps={props.fieldProps}
            emptyText={props.emptyText}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const setSearchValue = (value?: string) => {
          searchValue.value = value
          ;(mergedOnSearch as ((value?: string) => void) | undefined)?.(value)
        }

        const treeSelectOnChange = (value: any, optionList: any, extra: any) => {
          if (showSearch && mergedAutoClearSearchValue) {
            fetchData(undefined)
            setSearchValue(undefined)
          }
          onChange?.(value, optionList, extra)
        }

        const editProps = {
          text: props.text,
          mode: props.mode,
          formItemRender: props.formItemRender,
          label: props.label,
          variant: props.variant ?? fieldProps?.variant,
          fieldProps,
          open,
          treeSelectRef,
          loading: loading.value,
          options: options.value,
          fetchData,
          fetchDataOnSearch,
          hasRequest: !!props.request,
          showSearch,
          showSearchConfig,
          searchValue: mergedSearchValue,
          setSearchValue,
          autoClearSearchValue: mergedAutoClearSearchValue,
          onClear,
          treeSelectOnChange,
          onBlur,
          layoutClassName: 'ant-pro-field-tree-select',
        }

        if (props.light)
          return <FieldTreeSelectLightEdit {...editProps} />

        return <FieldTreeSelectEdit {...editProps} />
      }

      return null
    }
  },
})
