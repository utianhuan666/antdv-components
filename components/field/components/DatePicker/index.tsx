import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDatePickerEdit from './FieldDatePickerEdit'
import FieldDatePickerRead from './FieldDatePickerRead'

dayjs.extend(weekOfYear)

const FieldDatePicker = defineComponent({
  name: 'FieldDatePicker',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
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
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldDatePickerRead
            text={props.text}
            mode={props.mode}
            format={props.format}
            render={props.render}
            fieldProps={props.fieldProps}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldDatePickerEdit
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

export default FieldDatePicker
