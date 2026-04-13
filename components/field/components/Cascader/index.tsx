import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData } from '../../types'
import type { ProFieldValueEnumType } from '../Select/types'
import { Cascader } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select/useFieldFetchData'
import { objectToMap, proFieldParsingText } from '../Select/utils'

export type { FieldCascaderProps } from './types'

/**
 * Build a flat valueEnum Map from cascader options by traversing children.
 */
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
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
  },
  setup(props) {
    const [loading, options, _fetchData] = useFieldFetchData(props)

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildCascaderOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <span>
            {proFieldParsingText(props.text, objectToMap(props.valueEnum || optionsValueEnum.value))}
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <Cascader
            placeholder={props.placeholder || '请选择'}
            allowClear={props.fieldProps?.allowClear !== false}
            loading={loading.value}
            options={options.value}
            {...props.fieldProps}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps, options: options.value, loading: loading.value }, dom)
        }
        return dom
      }

      return null
    }
  },
})
