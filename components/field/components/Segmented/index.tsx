import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Segmented } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export default defineComponent({
  name: 'FieldSegmented',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    /** Resolve label from options/valueEnum matching text value */
    const displayLabel = computed(() => {
      const options = props.fieldProps?.options
      const valueEnum = props.fieldProps?.valueEnum

      if (options?.length) {
        const matched = options.find((o: any) => o.value === props.text)
        if (matched)
          return matched.label
      }

      if (valueEnum) {
        const entry = valueEnum[props.text as string]
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
            options={restFieldProps.options ?? []}
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
