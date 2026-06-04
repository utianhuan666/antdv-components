import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldCascaderEdit from './FieldCascaderEdit'
import FieldCascaderLightEdit from './FieldCascaderLightEdit'
import FieldCascaderRead from './FieldCascaderRead'

export type { FieldCascaderProps, GroupProps } from './types'

function buildCascaderOptionsValueEnum(
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
  name: 'FieldCascader',
  props: {
    text: { type: null as unknown as PropType<any>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
    light: { type: Boolean, default: false },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    proFieldKey: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
  },
  setup(props, { expose }) {
    const cascaderRef = ref<any>(null)
    const open = ref(false)
    const [loading, options, fetchData] = useFieldFetchData(props)

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
        return (
          <FieldCascaderRead
            text={props.text}
            mode={props.mode}
            valueEnum={props.valueEnum}
            optionsValueEnum={optionsValueEnum.value}
            render={props.render}
            fieldProps={props.fieldProps}
            emptyText={props.emptyText}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const editProps = {
          text: props.text,
          mode: props.mode,
          placeholder: props.placeholder,
          formItemRender: props.formItemRender,
          label: props.label,
          variant: props.variant,
          fieldProps: props.fieldProps,
          options: options.value,
          loading: loading.value,
          layoutClassName: 'ant-pro-field-cascader',
          open,
          cascaderRef,
        }

        if (props.light)
          return <FieldCascaderLightEdit {...editProps} />

        return <FieldCascaderEdit {...editProps} />
      }

      return null
    }
  },
})
