import type { DatePickerProps } from 'antdv-next'
import type { IntlType } from '../../../provider'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDatePickerEdit from './FieldDatePickerEdit'
import FieldDatePickerLightEdit from './FieldDatePickerLightEdit'
import FieldDatePickerRead from './FieldDatePickerRead'

dayjs.extend(weekOfYear)

type FieldDatePickerProps = {
  text: string | number
  format?: string
  showTime?: DatePickerProps['showTime']
  variant?: DatePickerProps['variant']
  picker?: DatePickerProps['picker']
  fieldProps?: DatePickerProps & {
    format?: DatePickerProps['format']
    picker?: DatePickerProps['picker']
  }
} & ProFieldLightProps

type FieldDatePickerFieldProps = NonNullable<ProFieldFC<FieldDatePickerProps>['__props']>

const intl: IntlType = {
  locale: 'default',
  getMessage: (_id: string, defaultMessage: string) => defaultMessage,
}

const FieldDatePicker: ProFieldFC<FieldDatePickerProps> = (props) => {
  const {
    text = '',
    mode = 'read',
    format = 'YYYY-MM-DD',
    label,
    light,
    render,
    formItemRender,
    showTime,
    fieldProps = {},
    picker,
    lightLabel,
    variant,
  } = props as FieldDatePickerFieldProps
  const open = ref(false)
  const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
    open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
  }
  const mergedPicker = fieldProps.picker ?? picker

  if (isProFieldReadMode(mode)) {
    return FieldDatePickerRead({
      text,
      mode,
      format,
      render,
      fieldProps,
      picker: mergedPicker,
      label,
      light,
      showTime,
      lightLabel,
      variant,
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
      showTime,
      fieldProps,
      picker: mergedPicker,
      variant,
      intl,
    }

    if (light) {
      return FieldDatePickerLightEdit({
        ...editProps,
        lightLabel,
        open: open.value,
        setOpen,
      })
    }

    return FieldDatePickerEdit(editProps)
  }

  return null
}

export default FieldDatePicker as any
