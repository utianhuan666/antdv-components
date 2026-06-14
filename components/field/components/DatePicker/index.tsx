import type { DatePickerProps } from 'antdv-next'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDatePickerEdit from './FieldDatePickerEdit'
import FieldDatePickerLightEdit from './FieldDatePickerLightEdit'
import FieldDatePickerRead from './FieldDatePickerRead'
import '../../initDayjs'

dayjs.extend(weekOfYear)

type FieldDatePickerInstance = InstanceType<typeof import('antdv-next')['DatePicker']>
export type FieldDatePickerExpose = Partial<FieldDatePickerInstance>

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

/**
 * 日期选择组件
 */
const FieldDatePicker = defineComponent<FieldDatePickerFieldProps>({
  name: 'FieldDatePicker',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'format',
    'label',
    'light',
    'render',
    'formItemRender',
    'showTime',
    'fieldProps',
    'picker',
    'lightLabel',
    'variant',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const open = ref(false)
    const innerRef = ref<FieldDatePickerInstance | null>(null)
    const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
      open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
    }

    expose(createRefProxy<FieldDatePickerInstance>(innerRef))

    return () => {
      const props = rawProps as FieldDatePickerFieldProps
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
      } = props
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
          }, innerRef)
        }

        return FieldDatePickerEdit(editProps, innerRef)
      }

      return null
    }
  },
})

export default FieldDatePicker
