import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Slider } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldSliderEdit',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | number[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const dom = (
        <Slider
          {...props.fieldProps}
          style={{ minWidth: 120, ...props.fieldProps?.style }}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
