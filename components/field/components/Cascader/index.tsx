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

type FieldCascaderInstance = InstanceType<typeof import('antdv-next')['Cascader']>
export type FieldCascaderExpose = Partial<FieldCascaderInstance> & {
  fetchData: (keyWord?: string) => void
}

type FieldCascaderComponentProps = NonNullable<
  ProFieldFC<Omit<GroupProps, 'fieldProps'> & FieldSelectProps<CascaderProps> & { cacheForSwr?: boolean }>['__props']
>

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
  inheritAttrs: false,
  props: fieldCascaderPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-field-cascader')
    const cascaderRef = ref<FieldCascaderInstance | null>(null)
    const open = ref(false)
    const intl = useIntl()
    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      open.value = typeof updater === 'function' ? updater(open.value) : updater
    }
    const [loading, options, fetchData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])

    expose(
      new Proxy({ fetchData } as FieldCascaderExpose, {
        get(target, key: string) {
          if (key in target)
            return target[key as keyof FieldCascaderExpose]
          return cascaderRef.value?.[key as keyof FieldCascaderInstance]
        },
        has(target, key: string) {
          return key in target || (!!cascaderRef.value && key in cascaderRef.value)
        },
      }),
    )

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined

      const {
        value: valuePropsName = 'value',
        label: labelPropsName = 'label',
        children: childrenPropsName = 'children',
      } = props.fieldProps?.fieldNames || {}

      const valuesMap = new Map()

      const traverseOptions = (_options?: RequestOptionsType[]): Map<any, any> => {
        if (!_options?.length) {
          return valuesMap
        }

        const length = _options.length
        let i = 0
        while (i < length) {
          const cur = _options[i++]!
          valuesMap.set(cur[valuePropsName], cur[labelPropsName])
          traverseOptions(cur[childrenPropsName])
        }
        return valuesMap
      }

      return traverseOptions(options.value)
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

export default FieldCascader
