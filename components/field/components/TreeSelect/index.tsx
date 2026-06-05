import type { TreeSelectProps } from 'antdv-next'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import type { TreeSelectFieldProps } from './types'
import { omit } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldTreeSelectEdit from './FieldTreeSelectEdit'
import FieldTreeSelectLightEdit from './FieldTreeSelectLightEdit'
import FieldTreeSelectRead from './FieldTreeSelectRead'

export type { FieldTreeSelectProps, TreeSelectFieldProps } from './types'

type FieldTreeSelectComponentProps = NonNullable<
  ProFieldFC<FieldSelectProps<TreeSelectFieldProps> & { cacheForSwr?: boolean }>['__props']
>

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
  options: RequestOptionsType[],
  fieldNames?: TreeSelectFieldProps['fieldNames'],
): Map<any, any> | undefined {
  if (!options?.length)
    return undefined

  const {
    value: valueName = 'value',
    label: labelName = 'label',
    children: childrenName = 'children',
  } = fieldNames || {}
  const valuesMap = new Map()
  const traverse = (opts: RequestOptionsType[]) => {
    for (const cur of opts) {
      valuesMap.set(cur[valueName], cur[labelName])
      if (cur[childrenName])
        traverse(cur[childrenName])
    }
  }
  traverse(options)
  return valuesMap
}

const fieldTreeSelectPropNames = [
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
  'light',
  'label',
  'variant',
  'proFieldKey',
  'defaultKeyWords',
  'cacheForSwr',
]

function withFieldTreeSelectDefaults(props: FieldTreeSelectComponentProps): FieldTreeSelectComponentProps {
  return new Proxy(props, {
    get(target, key: string) {
      const value = (target as unknown as Record<string, unknown>)[key]
      if (value !== undefined) {
        if (key === 'light' && value === '')
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
      if (key === 'light')
        return false
      return undefined
    },
  }) as FieldTreeSelectComponentProps
}

const FieldTreeSelect = defineComponent({
  name: 'FieldTreeSelect',
  props: fieldTreeSelectPropNames,
  setup(rawProps, { expose }) {
    const props = withFieldTreeSelectDefaults(rawProps as unknown as FieldTreeSelectComponentProps)
    const treeSelectRef = ref<any>(null)
    const fetchProps = new Proxy(props, {
      get(target, key: string) {
        if (key === 'defaultKeyWords')
          return target.fieldProps?.searchValue ?? target.defaultKeyWords
        return (target as unknown as Record<string, unknown>)[key]
      },
    }) as Parameters<typeof useFieldFetchData>[0]
    const [loading, options, fetchData] = useFieldFetchData(fetchProps)
    const open = ref(false)
    const searchValue = ref<string | undefined>(props.fieldProps?.searchValue)
    const intl: IntlType = {
      locale: 'default',
      getMessage: (_id: string, defaultMessage: string) => defaultMessage,
    }
    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      open.value = typeof updater === 'function' ? updater(open.value) : updater
    }

    expose({
      fetchData,
      treeSelectRef,
    })

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildTreeOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
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
        return FieldTreeSelectRead({
          text: props.text,
          mode: props.mode,
          valueEnum: props.valueEnum,
          optionsValueEnum: optionsValueEnum.value,
          options: options.value,
          render: props.render,
          fieldProps: props.fieldProps,
          emptyText: props.emptyText,
        })
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const setSearchValue = (
          updater:
            | string
            | undefined
            | ((prev: string | undefined) => string | undefined),
        ) => {
          const nextValue = typeof updater === 'function'
            ? updater(searchValue.value)
            : updater
          searchValue.value = nextValue
          ;(mergedOnSearch as ((value?: string) => void) | undefined)?.(nextValue)
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
          mode: props.mode as 'edit',
          formItemRender: props.formItemRender,
          label: props.label,
          variant: props.variant ?? fieldProps?.variant,
          fieldProps,
          open: open.value,
          setOpen,
          treeSelectRef,
          intl,
          loading: loading.value,
          options: options.value as NonNullable<TreeSelectProps['treeData']>,
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
          return FieldTreeSelectLightEdit(editProps)

        return FieldTreeSelectEdit(editProps)
      }

      return null
    }
  },
})

export default FieldTreeSelect
