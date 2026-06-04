import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { InputNumber } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldPercentEdit',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    prefix: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    placeholderValue: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const dom = (
        <InputNumber
          {...({
            formatter: (value: string | number | undefined) => {
              if (value && props.prefix)
                return `${props.prefix} ${value}`.replace(/\B(?=(\d{3})+(?!\d)$)/g, ',')

              return value as string
            },
            parser: (value: string | undefined) => (value ? value.replace(/.*\s|,/g, '') : ''),
            placeholder: props.placeholderValue,
            ...props.fieldProps,
          } as any)}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
