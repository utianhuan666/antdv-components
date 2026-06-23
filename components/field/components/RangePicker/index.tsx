import type { ProFieldFC } from '../../types'
import type { FieldRangePickerProps } from './types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { formatDate } from '../DatePicker/datePickerUtils'
import FieldRangePickerEdit from './FieldRangePickerEdit'
import FieldRangePickerLightEdit from './FieldRangePickerLightEdit'
import FieldRangePickerRead from './FieldRangePickerRead'

type FieldRangePickerInstance = InstanceType<typeof import('antdv-next')['DateRangePicker']>
export type FieldRangePickerExpose = Partial<FieldRangePickerInstance>

type FieldRangePickerFieldProps = NonNullable<ProFieldFC<FieldRangePickerProps>['__props']>

const FieldRangePicker = defineComponent<FieldRangePickerFieldProps>({
  name: 'FieldRangePicker',
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
    const innerRef = ref<FieldRangePickerInstance | null>(null)
    const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
      open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
    }

    expose(createRefProxy<FieldRangePickerInstance>(innerRef))

    return () => {
      const props = rawProps as FieldRangePickerFieldProps
      const {
        text: rawText = [],
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
      const text = Array.isArray(rawText) ? rawText : []
      const [startText, endText] = text
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
          picker,
          formItemRender,
          showTime,
          lightLabel,
          variant,
          fieldProps,
          parsedStartText,
          parsedEndText,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        const editProps = {
          text,
          mode,
          label,
          format,
          render,
          picker,
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
          }, innerRef)
        }

        return FieldRangePickerEdit(editProps, innerRef)
      }

      return null
    }
  },
})

export default FieldRangePicker
