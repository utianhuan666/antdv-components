import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldRangePickerEdit from './FieldRangePickerEdit'
import FieldRangePickerRead from './FieldRangePickerRead'

const FieldRangePicker = defineComponent({
  name: 'FieldRangePicker',
  props: {
    text: { type: Array as PropType<string[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'YYYY-MM-DD' },
    showTime: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    picker: { type: String as PropType<'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const [startText, endText] = Array.isArray(props.text) ? props.text : []

      const genFormatText = (formatValue: dayjs.Dayjs): string => {
        if (typeof props.fieldProps?.format === 'function') {
          return props.fieldProps.format(formatValue)
        }
        return props.fieldProps?.format || props.format || 'YYYY-MM-DD'
      }

      const parsedStartText: string = startText
        ? dayjs(startText).format(genFormatText(dayjs(startText)))
        : ''
      const parsedEndText: string = endText
        ? dayjs(endText).format(genFormatText(dayjs(endText)))
        : ''

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldRangePickerRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            parsedStartText={parsedStartText}
            parsedEndText={parsedEndText}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldRangePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            showTime={props.showTime}
            picker={props.picker}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})

export default FieldRangePicker
