import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { clsx, omit } from '@v-c/util'
import { CheckboxGroup } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldCheckboxEdit',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | null>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    options: { type: Array as PropType<any[]>, default: () => [] },
    loading: { type: Boolean, default: false },
    layout: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props) {
    return () => {
      const restFieldProps = omit(props.fieldProps || {}, ['fieldNames'])
      const dom = (
        <CheckboxGroup
          {...restFieldProps}
          class={clsx(
            props.fieldProps?.class,
            props.fieldProps?.className,
            `ant-pro-field-checkbox-${props.layout}`,
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
