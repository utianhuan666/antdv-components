import type { RangePickerProps } from 'antdv-next'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import { ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatDate } from '../DatePicker/datePickerUtils'
import FieldRangePickerEdit from './FieldRangePickerEdit'
import FieldRangePickerLightEdit from './FieldRangePickerLightEdit'
import FieldRangePickerRead from './FieldRangePickerRead'

type FieldRangePickerProps = {
  text: string[]
  format?: string
  variant?: RangePickerProps['variant']
  showTime?: RangePickerProps['showTime']
  picker?: RangePickerProps['picker']
  fieldProps?: RangePickerProps & {
    format?: RangePickerProps['format']
    picker?: RangePickerProps['picker']
  }
} & ProFieldLightProps

type FieldRangePickerFieldProps = NonNullable<ProFieldFC<FieldRangePickerProps>['__props']>

const FieldRangePicker: ProFieldFC<FieldRangePickerFieldProps> = (props) => {
  const {
    text: rawText,
    mode = 'read',
    light,
    label,
    format = 'YYYY-MM-DD',
    render,
    picker,
    formItemRender,
    showTime,
    lightLabel,
    variant,
    fieldProps = {},
  } = props
  const intl = useIntl()
  const text = Array.isArray(rawText) ? rawText : []
  const [startText, endText] = text
  const open = ref(false)
  const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
    open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
  }
  const mergedPicker = fieldProps.picker ?? picker
  const parsedStartText: string = startText
    ? formatDate(startText, fieldProps.format || format, mergedPicker)
    : ''
  const parsedEndText: string = endText
    ? formatDate(endText, fieldProps.format || format, mergedPicker)
    : ''

  if (isProFieldReadMode(mode)) {
    return FieldRangePickerRead({
      text,
      mode,
      light,
      label,
      format,
      render,
      picker: mergedPicker,
      formItemRender,
      showTime,
      lightLabel,
      variant,
      fieldProps,
      parsedStartText,
      parsedEndText,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    const editProps = {
      text,
      mode,
      label,
      format,
      render,
      picker: mergedPicker,
      formItemRender,
      showTime,
      variant,
      fieldProps,
      intl,
    }

    if (light) {
      return FieldRangePickerLightEdit({
        ...editProps,
        lightLabel,
        open: open.value,
        setOpen,
      })
    }

    return FieldRangePickerEdit(editProps)
  }

  return null
}

export default FieldRangePicker as any
