import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { omit } from '@v-c/util'
import { Segmented } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldSegmentedEdit',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    options: { type: Array as PropType<any[]>, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const restFieldProps = omit(props.fieldProps || {}, ['allowClear'])
      const dom = (
        <Segmented
          {...restFieldProps}
          options={props.options}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps, options: props.options, loading: props.loading }, dom)

      return dom
    }
  },
})
