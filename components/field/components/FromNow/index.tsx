import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { DatePicker, Tooltip } from 'antdv-next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

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
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const formatStr = props.fieldProps?.format || props.format || 'YYYY-MM-DD HH:mm:ss'
        const dom = (
          <Tooltip title={dayjs(props.text).format(formatStr)}>
            {dayjs(props.text).fromNow()}
          </Tooltip>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const momentValue = props.fieldProps?.value ? dayjs(props.fieldProps.value) : undefined
        const dom = (
          <DatePicker
            placeholder="请选择"
            showTime
            {...props.fieldProps}
            value={momentValue}
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
