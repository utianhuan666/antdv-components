import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { omit } from '@v-c/util'
import { Switch } from 'antdv-next'
import { defineComponent } from 'vue'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'

export default defineComponent({
  name: 'FieldSwitchLightEdit',
  props: {
    text: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const restFieldProps = omit(props.fieldProps || {}, ['value'])
      const editDom = (
        <Switch
          size="small"
          {...restFieldProps}
          checked={props.fieldProps?.checked ?? props.fieldProps?.value}
        />
      )
      const dom = (
        <FieldLabel
          label={props.label}
          disabled={props.fieldProps?.disabled}
          variant={props.variant ?? props.fieldProps?.variant}
          downIcon={false}
          value={<div style={{ paddingInlineStart: '8px' }}>{editDom}</div>}
          allowClear={false}
        />
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
