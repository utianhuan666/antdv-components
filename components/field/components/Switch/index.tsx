import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSwitchEdit from './FieldSwitchEdit'
import FieldSwitchLightEdit from './FieldSwitchLightEdit'
import FieldSwitchRead from './FieldSwitchRead'

const FieldSwitch = defineComponent({
  name: 'FieldSwitch',
  props: {
    text: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    light: { type: Boolean, default: false },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Boolean, Object, Number] as PropType<VNodeChild | false>, default: '-' },
  },
  setup(props) {
    const readLabel = computed(() => {
      const text = props.text
      if (text === undefined || text === null || `${text}`.length < 1)
        return '-'

      return text
        ? (props.fieldProps?.checkedChildren ?? '打开')
        : (props.fieldProps?.unCheckedChildren ?? '关闭')
    })

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldSwitchRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            readLabel={readLabel.value}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        if (props.light) {
          return (
            <FieldSwitchLightEdit
              text={props.text}
              mode={props.mode}
              label={props.label}
              variant={props.variant ?? props.fieldProps?.variant}
              formItemRender={props.formItemRender}
              fieldProps={props.fieldProps}
            />
          )
        }

        return (
          <FieldSwitchEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})

export default FieldSwitch
