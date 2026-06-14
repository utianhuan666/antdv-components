import type { TreeSelectProps } from 'antdv-next'
import type { ProSchemaValueEnumMap } from '../../../utils/typing'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import type { TreeSelectFieldProps } from './types'
import { omit } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOnlyMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldTreeSelectEdit from './FieldTreeSelectEdit'
import FieldTreeSelectLightEdit from './FieldTreeSelectLightEdit'
import FieldTreeSelectRead from './FieldTreeSelectRead'

export type { FieldTreeSelectProps, TreeSelectFieldProps } from './types'

type FieldTreeSelectInstance = InstanceType<typeof import('antdv-next')['TreeSelect']>
export type FieldTreeSelectExpose = Partial<FieldTreeSelectInstance> & {
  fetchData: (keyWord?: string) => void
}

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
): ProSchemaValueEnumMap | undefined {
  if (!options?.length)
    return undefined

  const {
    value: valueName = 'value',
    label: labelName = 'label',
    children: childrenName = 'children',
  } = fieldNames || {}
  const valuesMap: ProSchemaValueEnumMap = new Map()
  const traverse = (opts: RequestOptionsType[]) => {
    for (const cur of opts) {
      valuesMap.set(cur[valueName], cur[labelName])
      const children = cur[childrenName] as RequestOptionsType[] | undefined
      if (children)
        traverse(children)
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

const FieldTreeSelect = defineComponent({
  name: 'FieldTreeSelect',
  props: fieldTreeSelectPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps as FieldTreeSelectComponentProps
    const prefixCls = useProPrefixCls('pro-field-tree-select')
    const treeSelectRef = ref<FieldTreeSelectInstance | null>(null)
    const fetchProps = new Proxy(props as Parameters<typeof useFieldFetchData>[0], {
      get(target, key: string) {
        if (key === 'defaultKeyWords') {
          const fieldProps = target.fieldProps as TreeSelectFieldProps | undefined
          return fieldProps?.searchValue ?? target.defaultKeyWords
        }
        return Reflect.get(target, key)
      },
    })
    const [loading, options, fetchData] = useFieldFetchData(fetchProps)
    const open = ref(false)
    const searchValue = ref<string | undefined>(props.fieldProps?.searchValue)
    const intl = useIntl()
    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      open.value = typeof updater === 'function' ? updater(open.value) : updater
    }

    expose(createRefProxy<FieldTreeSelectInstance, Pick<FieldTreeSelectExpose, 'fetchData'>>(treeSelectRef, { fetchData }))

    const optionsValueEnum = computed(() => {
      const mode = props.mode ?? 'read'
      if (!isProFieldReadMode(mode))
        return undefined
      return buildTreeOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'
      const emptyText = props.emptyText ?? '-'
      const light = props.light === true
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

      if (isProFieldReadMode(mode)) {
        return FieldTreeSelectRead({
          text,
          mode,
          valueEnum: props.valueEnum,
          optionsValueEnum: optionsValueEnum.value,
          options: options.value,
          render: props.render,
          fieldProps: props.fieldProps,
          emptyText,
        })
      }

      if (isProFieldEditOnlyMode(mode)) {
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

        const treeSelectOnChange: TreeSelectProps['onChange'] = (value, optionList, extra) => {
          if (showSearch && mergedAutoClearSearchValue) {
            fetchData(undefined)
            setSearchValue(undefined)
          }
          onChange?.(value, optionList, extra)
        }

        const editProps = {
          text: String(text),
          mode: mode as 'edit',
          formItemRender: props.formItemRender,
          label: props.label,
          variant: props.variant ?? fieldProps?.variant,
          fieldProps,
          open: open.value,
          setOpen,
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
          layoutClassName: prefixCls.value,
        }

        if (light)
          return FieldTreeSelectLightEdit(editProps, treeSelectRef)

        return FieldTreeSelectEdit(editProps, treeSelectRef)
      }

      return null
    }
  },
})

export default FieldTreeSelect as unknown as ProFieldFC<FieldSelectProps<TreeSelectFieldProps> & {
  cacheForSwr?: boolean
}>
