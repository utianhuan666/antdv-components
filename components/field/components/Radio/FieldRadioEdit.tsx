import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { clsx } from '@v-c/util'
import { RadioGroup } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldRadioEdit',
  props: {
    text: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    radioType: { type: String as PropType<'default' | 'button'>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | null>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    options: { type: Array as PropType<any[]>, default: () => [] },
    loading: { type: Boolean, default: false },
    layout: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props) {
    return () => {
      const dom = (
        <RadioGroup
          optionType={props.radioType}
          {...props.fieldProps}
          class={clsx(
            props.fieldProps?.class,
            props.fieldProps?.className,
            `ant-pro-field-radio-${props.fieldProps?.layout || props.layout}`,
          )}
          options={props.options}
        />
      )

      if (props.formItemRender) {
        return props.formItemRender(
          props.text,
          { mode: props.mode, ...props.fieldProps, options: props.options, loading: props.loading },
          dom,
        ) ?? null
      }

      return dom
    }
  },
})
