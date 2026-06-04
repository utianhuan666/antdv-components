import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldFromNowEdit from './FieldFromNowEdit'
import FieldFromNowRead from './FieldFromNowRead'

dayjs.extend(relativeTime)

export default defineComponent({
  name: 'FieldFromNow',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    format: { type: String as PropType<string>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldFromNowRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            format={props.format}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldFromNowEdit
            text={props.text}
            mode={props.mode}
            variant={props.variant}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})
