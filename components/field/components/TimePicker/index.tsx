import type { TimePickerProps, TimeRangePickerProps } from 'antdv-next'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatDate } from '../DatePicker/datePickerUtils'
import FieldTimePickerEdit from './FieldTimePickerEdit'
import FieldTimePickerLightEdit from './FieldTimePickerLightEdit'
import FieldTimePickerRead from './FieldTimePickerRead'
import FieldTimeRangePickerEdit from './FieldTimeRangePickerEdit'
import FieldTimeRangePickerLightEdit from './FieldTimeRangePickerLightEdit'
import FieldTimeRangePickerRead from './FieldTimeRangePickerRead'

type FieldTimePickerProps = {
  text: string | number
  format?: string
  variant?: TimePickerProps['variant']
  fieldProps?: TimePickerProps & {
    format?: string
  }
} & ProFieldLightProps

type FieldTimePickerFieldProps = NonNullable<ProFieldFC<FieldTimePickerProps>['__props']>

type FieldTimeRangePickerProps = {
  text: string[] | number[]
  format?: string
  variant?: TimeRangePickerProps['variant']
  fieldProps?: TimeRangePickerProps & {
    format?: string
  }
} & ProFieldLightProps

type FieldTimeRangePickerFieldProps = NonNullable<ProFieldFC<FieldTimeRangePickerProps>['__props']>

/**
 * Time picker field component
 */
const FieldTimePicker: ProFieldFC<FieldTimePickerProps> = (props) => {
  const {
    text,
    mode = 'read',
    light,
    label,
    format = 'HH:mm:ss',
    render,
    formItemRender,
    fieldProps = {},
    lightLabel,
    variant,
  } = props as FieldTimePickerFieldProps
  const intl = useIntl()
  const open = ref(false)
  const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
    open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
  }
  const finalFormat = fieldProps.format || format

  if (isProFieldReadMode(mode)) {
    return FieldTimePickerRead({
      text,
      mode,
      light,
      label,
      format,
      render,
      formItemRender,
      fieldProps,
      lightLabel,
      variant,
      finalFormat,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    const editProps = {
      text,
      mode,
      label,
      format,
      render,
      formItemRender,
      fieldProps,
      variant,
      finalFormat,
    }

    if (light) {
      return FieldTimePickerLightEdit({
        ...editProps,
        lightLabel,
        open: open.value,
        setOpen,
        intl,
      })
    }

    return FieldTimePickerEdit(editProps)
  }

  return null
}

/**
 * Time range picker field component
 */
const FieldTimeRangePickerComponent: ProFieldFC<FieldTimeRangePickerProps> = (props) => {
  const {
    text: rawText,
    light,
    label,
    mode = 'read',
    lightLabel,
    format = 'HH:mm:ss',
    render,
    formItemRender,
    fieldProps = {},
    variant,
  } = props as FieldTimeRangePickerFieldProps
  const intl = useIntl()
  const text = Array.isArray(rawText) ? rawText : []
  const open = ref(false)
  const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
    open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
  }
  const finalFormat = fieldProps.format || format
  const [startText, endText] = text

  const parsedStartText: string = startText
    ? formatDate(startText, finalFormat)
    : ''
  const parsedEndText: string = endText
    ? formatDate(endText, finalFormat)
    : ''

  if (isProFieldReadMode(mode)) {
    return FieldTimeRangePickerRead({
      text,
      light,
      label,
      mode,
      lightLabel,
      format,
      render,
      formItemRender,
      fieldProps,
      variant,
      parsedStartText,
      parsedEndText,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    const editProps = {
      text,
      label,
      mode,
      format,
      render,
      formItemRender,
      fieldProps,
      variant,
      finalFormat,
    }

    if (light) {
      return FieldTimeRangePickerLightEdit({
        ...editProps,
        lightLabel,
        open: open.value,
        setOpen,
        intl,
      })
    }

    return FieldTimeRangePickerEdit(editProps)
  }

  return null
}

export const FieldTimeRangePicker = FieldTimeRangePickerComponent as any

export default FieldTimePicker as any
