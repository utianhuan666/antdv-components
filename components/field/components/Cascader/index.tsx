import type { CascaderProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import type { GroupProps } from './types'
import { computed, defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { isProFieldEditOnlyMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldCascaderEdit from './FieldCascaderEdit'
import FieldCascaderLightEdit from './FieldCascaderLightEdit'
import FieldCascaderRead from './FieldCascaderRead'

export type { FieldCascaderProps, GroupProps } from './types'

type FieldCascaderComponentProps = NonNullable<
  ProFieldFC<Omit<GroupProps, 'fieldProps'> & FieldSelectProps<CascaderProps> & { cacheForSwr?: boolean }>['__props']
>

function buildCascaderOptionsValueEnum(
  options: RequestOptionsType[],
  fieldNames?: CascaderProps['fieldNames'],
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

const fieldCascaderPropNames = [
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
  'placeholder',
  'light',
  'label',
  'variant',
  'proFieldKey',
  'defaultKeyWords',
  'cacheForSwr',
]

const FieldCascader = defineComponent<FieldCascaderComponentProps>({
  name: 'FieldCascader',
  props: fieldCascaderPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-field-cascader')
    const cascaderRef = ref<any>(null)
    const open = ref(false)
    const intl = useIntl()
    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      open.value = typeof updater === 'function' ? updater(open.value) : updater
    }
    const [loading, options, fetchData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])

    expose({
      fetchData,
      cascaderRef,
      focus: () => cascaderRef.value?.focus?.(),
      blur: () => cascaderRef.value?.blur?.(),
    })

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildCascaderOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      const {
        placeholder,
        formItemRender,
        mode,
        render,
        label,
        light,
        variant,
        ...rest
      } = props

      if (isProFieldReadMode(mode)) {
        return FieldCascaderRead({
          placeholder,
          formItemRender,
          mode,
          render,
          label,
          light,
          variant,
          optionsValueEnum: optionsValueEnum.value,
          ...rest,
        })
      }

      if (isProFieldEditOnlyMode(mode)) {
        const editProps = {
          ...rest,
          placeholder,
          formItemRender,
          mode,
          render,
          label,
          variant,
          options: options.value as NonNullable<CascaderProps['options']>,
          loading: loading.value,
          layoutClassName: prefixCls.value,
          open: open.value,
          setOpen,
          cascaderRef,
          intl,
        }

        if (light)
          return FieldCascaderLightEdit(editProps)

        return FieldCascaderEdit(editProps)
      }

      return null
    }
  },
})

export default FieldCascader as any
