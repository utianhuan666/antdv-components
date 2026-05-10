import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldRequestData } from '../../types'
import type { ProFieldValueEnumType } from '../Select/types'
import { Segmented } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'

export default defineComponent({
  name: 'FieldSegmented',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
    params: { type: Object as PropType<any>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    const [, options] = useFieldFetchData(props as any)
    const segmentedOptions = computed(() =>
      options.value.map((item: any) => ({
        label: item.label ?? item.text,
        value: item.value,
        disabled: item.disabled,
        icon: item.icon,
      })).filter((item: any) => item.value !== undefined),
    )

    /** Resolve label from options/valueEnum matching text value */
    const displayLabel = computed(() => {
      const optionItems = options.value
      const valueEnum = props.valueEnum

      if (optionItems?.length) {
        const matched = optionItems.find((o: any) => o.value === props.text)
        if (matched)
          return matched.label
      }

      if (valueEnum) {
        const entry = valueEnum instanceof Map ? valueEnum.get(props.text) : valueEnum[props.text as string]
        if (entry)
          return typeof entry === 'object' ? entry.text : entry
      }

      return props.text
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = <>{displayLabel.value ?? props.emptyText}</>
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const { allowClear, ...restFieldProps } = props.fieldProps || {}
        const dom = (
          <Segmented
            options={segmentedOptions.value}
            {...restFieldProps}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
