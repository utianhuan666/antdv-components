import type { CascaderProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import type { GroupProps } from './types'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
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

function withFieldCascaderDefaults(props: FieldCascaderComponentProps): FieldCascaderComponentProps {
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
  }) as FieldCascaderComponentProps
}

const FieldCascader = defineComponent({
  name: 'FieldCascader',
  props: fieldCascaderPropNames,
  setup(rawProps, { expose }) {
    const props = withFieldCascaderDefaults(rawProps as unknown as FieldCascaderComponentProps)
    const cascaderRef = ref<any>(null)
    const open = ref(false)
    const intl = {
      getMessage: (_id: string, defaultMessage: string) => defaultMessage,
    }
    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      open.value = typeof updater === 'function' ? updater(open.value) : updater
    }
    const [loading, options, fetchData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])

    expose({
      fetchData,
      cascaderRef,
    })

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildCascaderOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return FieldCascaderRead({
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
        const editProps = {
          text: props.text,
          mode: props.mode,
          placeholder: props.placeholder,
          formItemRender: props.formItemRender,
          render: props.render,
          label: props.label,
          variant: props.variant,
          fieldProps: props.fieldProps,
          options: options.value as NonNullable<CascaderProps['options']>,
          loading: loading.value,
          layoutClassName: 'ant-pro-field-cascader',
          open: open.value,
          setOpen,
          cascaderRef,
          intl,
        }

        if (props.light)
          return FieldCascaderLightEdit(editProps)

        return FieldCascaderEdit(editProps)
      }

      return null
    }
  },
})

export default FieldCascader
