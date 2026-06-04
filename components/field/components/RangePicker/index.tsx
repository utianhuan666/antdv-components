import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatDate } from '../DatePicker/datePickerUtils'
import FieldRangePickerEdit from './FieldRangePickerEdit'
import FieldRangePickerLightEdit from './FieldRangePickerLightEdit'
import FieldRangePickerRead from './FieldRangePickerRead'

const FieldRangePicker = defineComponent({
  name: 'FieldRangePicker',
  props: {
    text: { type: Array as PropType<string[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'YYYY-MM-DD' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    light: { type: Boolean, default: false },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
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
      const mergedPicker = props.fieldProps?.picker ?? props.picker
      const parsedStartText: string = startText
        ? formatDate(startText, props.fieldProps?.format || props.format, mergedPicker)
        : ''
      const parsedEndText: string = endText
        ? formatDate(endText, props.fieldProps?.format || props.format, mergedPicker)
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
        if (props.light) {
          return (
            <FieldRangePickerLightEdit
              text={props.text}
              mode={props.mode}
              label={props.label}
              format={props.format}
              showTime={props.showTime}
              picker={props.picker}
              variant={props.variant}
              formItemRender={props.formItemRender}
              fieldProps={props.fieldProps}
            />
          )
        }

        return (
          <FieldRangePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            showTime={props.showTime}
            picker={props.picker}
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

export default FieldRangePicker
