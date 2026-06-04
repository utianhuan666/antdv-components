import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldSwitchEdit',
  props: {
    text: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const restFieldProps = omit(props.fieldProps || {}, ['value'])
      const dom = (
        <Switch
          {...restFieldProps}
          checked={props.fieldProps?.checked ?? props.fieldProps?.value}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
