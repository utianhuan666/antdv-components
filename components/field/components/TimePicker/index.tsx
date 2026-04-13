import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import dayjs from 'dayjs'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTimePickerEdit from './FieldTimePickerEdit'
import FieldTimePickerRead from './FieldTimePickerRead'
import FieldTimeRangePickerEdit from './FieldTimeRangePickerEdit'
import FieldTimeRangePickerRead from './FieldTimeRangePickerRead'

/**
 * Time picker field component
 */
const FieldTimePicker = defineComponent({
  name: 'FieldTimePicker',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'HH:mm:ss' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const finalFormat = props.fieldProps?.format || props.format

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldTimePickerRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            finalFormat={finalFormat}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldTimePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})

/**
 * Time range picker field component
 */
export const FieldTimeRangePicker = defineComponent({
  name: 'FieldTimeRangePicker',
  props: {
    text: { type: Array as PropType<(string | number)[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'HH:mm:ss' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const finalFormat = props.fieldProps?.format || props.format
      const [startText, endText] = Array.isArray(props.text) ? props.text : []

      const startIsNumberOrDayjs = dayjs.isDayjs(startText) || typeof startText === 'number'
      const endIsNumberOrDayjs = dayjs.isDayjs(endText) || typeof endText === 'number'

      const parsedStartText: string = startText
        ? dayjs(startText as any, startIsNumberOrDayjs ? undefined : finalFormat).format(finalFormat)
        : ''
      const parsedEndText: string = endText
        ? dayjs(endText as any, endIsNumberOrDayjs ? undefined : finalFormat).format(finalFormat)
        : ''

      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldTimeRangePickerRead
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
          <FieldTimeRangePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})

export default FieldTimePicker
