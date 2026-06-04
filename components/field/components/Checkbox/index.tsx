import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'
import type { FieldCheckboxProps } from './types'
import { Spin } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldCheckboxEdit from './FieldCheckboxEdit'
import FieldCheckboxRead from './FieldCheckboxRead'

export type { FieldCheckboxProps }

function buildOptionsValueEnum(options: any[] | undefined) {
  if (!options?.length)
    return undefined

  return options.reduce<Record<string, any>>((pre, cur) => {
    pre[cur?.value ?? ''] = cur?.label
    return pre
  }, {})
}

const FieldCheckbox = defineComponent({
  name: 'FieldCheckbox',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    options: { type: Array as PropType<any[]>, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
    layout: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props, { expose }) {
    const [loading, fetchedOptions, fetchData] = useFieldFetchData(props as any)
    const options = computed(() => props.request ? fetchedOptions.value : (props.options ?? fetchedOptions.value))
    const optionsValueEnum = computed(() => buildOptionsValueEnum(options.value))

    expose({ fetchData })

    return () => {
      if (loading.value)
        return <Spin size="small" />

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldCheckboxRead
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

      if (props.mode === 'edit') {
        return (
          <FieldCheckboxEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            options={options.value}
            loading={loading.value}
            layout={props.layout}
          />
        )
      }

      return null
    }
  },
})

export default FieldCheckbox
