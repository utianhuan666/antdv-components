import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatDate } from '../DatePicker/datePickerUtils'
import FieldTimePickerEdit from './FieldTimePickerEdit'
import FieldTimePickerLightEdit from './FieldTimePickerLightEdit'
import FieldTimePickerRead from './FieldTimePickerRead'
import FieldTimeRangePickerEdit from './FieldTimeRangePickerEdit'
import FieldTimeRangePickerLightEdit from './FieldTimeRangePickerLightEdit'
import FieldTimeRangePickerRead from './FieldTimeRangePickerRead'

/**
 * Time picker field component
 */
const FieldTimePicker = defineComponent({
  name: 'FieldTimePicker',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'HH:mm:ss' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    light: { type: Boolean, default: false },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
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
        if (props.light) {
          return (
            <FieldTimePickerLightEdit
              text={props.text}
              mode={props.mode}
              label={props.label}
              format={props.format}
              finalFormat={finalFormat}
              variant={props.variant}
              formItemRender={props.formItemRender}
              fieldProps={props.fieldProps}
            />
          )
        }

        return (
          <FieldTimePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            finalFormat={finalFormat}
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

/**
 * Time range picker field component
 */
export const FieldTimeRangePicker = defineComponent({
  name: 'FieldTimeRangePicker',
  props: {
    text: { type: Array as PropType<(string | number)[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    format: { type: String, default: 'HH:mm:ss' },
    label: { type: null as unknown as PropType<any>, default: undefined },
    light: { type: Boolean, default: false },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const finalFormat = props.fieldProps?.format || props.format
      const [startText, endText] = Array.isArray(props.text) ? props.text : []

      const parsedStartText: string = startText
        ? formatDate(startText, finalFormat)
        : ''
      const parsedEndText: string = endText
        ? formatDate(endText, finalFormat)
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
        if (props.light) {
          return (
            <FieldTimeRangePickerLightEdit
              text={props.text}
              mode={props.mode}
              label={props.label}
              format={props.format}
              finalFormat={finalFormat}
              variant={props.variant}
              formItemRender={props.formItemRender}
              fieldProps={props.fieldProps}
            />
          )
        }

        return (
          <FieldTimeRangePickerEdit
            text={props.text}
            mode={props.mode}
            format={props.format}
            finalFormat={finalFormat}
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

export default FieldTimePicker
