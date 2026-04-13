import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Switch } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

const FieldSwitch = defineComponent({
  name: 'FieldSwitch',
  props: {
    text: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Boolean, Object, Number] as PropType<VNodeChild | false>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const text = props.text
        let readLabel: string = '-'
        if (text !== undefined && text !== null && `${text}`.length > 0) {
          readLabel = text
            ? (props.fieldProps?.checkedChildren ?? '打开')
            : (props.fieldProps?.unCheckedChildren ?? '关闭')
        }

        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, <>{readLabel}</>) ?? props.emptyText
        }
        return <>{readLabel}</>
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <Switch
            checked={props.fieldProps?.checked ?? props.fieldProps?.value}
            {...props.fieldProps}
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

export default FieldSwitch
