import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldSelectProps, ProFieldValueEnumType } from './types'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSelectEdit from './FieldSelectEdit'
import FieldSelectRead from './FieldSelectRead'
import { useFieldFetchData } from './useFieldFetchData'

export type { FieldSelectProps, ProFieldValueEnumType }
export { proFieldParsingValueEnumToArray } from './useFieldFetchData'
export { useFieldFetchData } from './useFieldFetchData'

/**
 * Build a valueEnum Map from options for read mode display.
 */
function buildOptionsValueEnum(
  options: any[],
  fieldNames?: Record<string, string>,
): Map<any, any> | undefined {
  if (!options?.length)
    return undefined

  const {
    value: valuePropsName = 'value',
    label: labelPropsName = 'label',
    options: optionsPropsName = 'options',
  } = fieldNames || {}

  const valuesMap = new Map()

  const traverseOptions = (_options: any[]) => {
    if (!_options?.length)
      return valuesMap
    for (const cur of _options) {
      valuesMap.set(cur[valuePropsName], cur[labelPropsName])
      traverseOptions(cur[optionsPropsName])
    }
    return valuesMap
  }

  return traverseOptions(options)
}

export default defineComponent({
  name: 'FieldSelect',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    request: { type: Function as PropType<FieldSelectProps['request']>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    render: { type: Function as PropType<FieldSelectProps['render']>, default: undefined },
    formItemRender: { type: Function as PropType<FieldSelectProps['formItemRender']>, default: undefined },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    proFieldKey: { type: [String, Number] as PropType<string | number>, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
  },
  setup(props) {
    const [loading, options, fetchData, resetData] = useFieldFetchData(props)

    const optionsValueEnum = computed(() => {
      if (!isProFieldReadMode(props.mode))
        return undefined
      return buildOptionsValueEnum(options.value, props.fieldProps?.fieldNames)
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldSelectRead
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
        return (
          <FieldSelectEdit
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            loading={loading.value}
            options={options.value}
            fetchData={fetchData}
            resetData={resetData}
            text={props.text}
          />
        )
      }

      return null
    }
  },
})
