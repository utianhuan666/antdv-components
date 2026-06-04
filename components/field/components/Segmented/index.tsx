import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData, ProFieldValueEnumType } from '../Select/types'
import { Spin } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldSegmentedEdit from './FieldSegmentedEdit'
import FieldSegmentedRead from './FieldSegmentedRead'

function buildOptionsValueEnum(options: any[] | undefined) {
  if (!options?.length)
    return undefined

  return options.reduce<Record<string, any>>((pre, cur) => {
    pre[cur?.value ?? ''] = cur?.label
    return pre
  }, {})
}

export default defineComponent({
  name: 'FieldSegmented',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    debounceTime: { type: Number, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
    cacheForSwr: { type: Boolean, default: undefined },
    options: { type: Array as PropType<any[]>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props, { expose }) {
    const [loading, fetchedOptions, fetchData] = useFieldFetchData(props as any)
    const options = computed(() => props.request ? fetchedOptions.value : (props.options ?? fetchedOptions.value))
    const segmentedOptions = computed(() =>
      options.value.map((item: any) => ({
        label: item.label ?? item.text,
        value: item.value,
        disabled: item.disabled,
        icon: item.icon,
      })).filter((item: any) => item.value !== undefined),
    )
    const optionsValueEnum = computed(() => buildOptionsValueEnum(options.value))

    expose({ fetchData })

    return () => {
      if (loading.value)
        return <Spin size="small" />

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldSegmentedRead
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
          <FieldSegmentedEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            options={segmentedOptions.value}
            loading={loading.value}
          />
        )
      }

      return null
    }
  },
})
