import type { TimePickerProps, TimeRangePickerProps } from 'antdv-next'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import dayjs from 'dayjs'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
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

type FieldTimePickerInstance = InstanceType<typeof import('antdv-next')['TimePicker']>
export type FieldTimePickerExpose = Partial<FieldTimePickerInstance>

type FieldTimePickerFieldProps = NonNullable<ProFieldFC<FieldTimePickerProps>['__props']>

type FieldTimeRangePickerProps = {
  text: string[] | number[]
  format?: string
  variant?: TimeRangePickerProps['variant']
  fieldProps?: TimeRangePickerProps & {
    format?: string
  }
} & ProFieldLightProps

type FieldTimeRangePickerInstance = InstanceType<typeof import('antdv-next')['TimeRangePicker']>
export type FieldTimeRangePickerExpose = Partial<FieldTimeRangePickerInstance>

type FieldTimeRangePickerFieldProps = NonNullable<ProFieldFC<FieldTimeRangePickerProps>['__props']>

/**
 * Time picker field component
 */
const FieldTimePicker = defineComponent<FieldTimePickerFieldProps>({
  name: 'FieldTimePicker',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'light',
    'label',
    'format',
    'render',
    'formItemRender',
    'fieldProps',
    'lightLabel',
    'variant',
  ],
  setup(rawProps, { expose }) {
    const [open, setOpen] = [ref(false), (nextOpen: boolean | ((open: boolean) => boolean)) => {
      open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
    }]
    const intl = useIntl()
    const innerRef = ref<FieldTimePickerInstance | null>(null)

    expose(createRefProxy<FieldTimePickerInstance>(innerRef))

    return () => {
      const {
        text,
        mode,
        light,
        label,
        format = 'HH:mm:ss',
        render,
        formItemRender,
        fieldProps,
        lightLabel,
        variant,
      } = rawProps
      const finalFormat = fieldProps?.format || format

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
        }, innerRef)
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
          return FieldTimePickerLightEdit(
            {
              ...editProps,
              lightLabel,
              open: open.value,
              setOpen,
              intl,
            },
            innerRef,
          )
        }
        return FieldTimePickerEdit(editProps, innerRef)
      }
      return null
    }
  },
})

/**
 * Time range picker field component
 */
const FieldTimeRangePickerComponent = defineComponent<FieldTimeRangePickerFieldProps>({
  name: 'FieldTimeRangePicker',
  inheritAttrs: false,
  props: [
    'text',
    'light',
    'label',
    'mode',
    'lightLabel',
    'format',
    'render',
    'formItemRender',
    'fieldProps',
    'variant',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const open = ref(false)
    const innerRef = ref<FieldTimeRangePickerInstance | null>(null)
    const setOpen = (nextOpen: boolean | ((open: boolean) => boolean)) => {
      open.value = typeof nextOpen === 'function' ? nextOpen(open.value) : nextOpen
    }

    expose(createRefProxy<FieldTimeRangePickerInstance>(innerRef))

    return () => {
      const {
        text,
        light,
        label,
        mode,
        lightLabel,
        format = 'HH:mm:ss',
        render,
        formItemRender,
        fieldProps,
        variant,
      } = rawProps as FieldTimeRangePickerFieldProps
      const finalFormat = fieldProps?.format || format
      const [startText, endText] = Array.isArray(text) ? text : []
      const startTextIsNumberOrMoment = dayjs.isDayjs(startText) || typeof startText === 'number'
      const endTextIsNumberOrMoment = dayjs.isDayjs(endText) || typeof endText === 'number'

      const parsedStartText: string = startText
        ? dayjs(startText, startTextIsNumberOrMoment ? undefined : finalFormat).format(finalFormat)
        : ''
      const parsedEndText: string = endText
        ? dayjs(endText, endTextIsNumberOrMoment ? undefined : finalFormat).format(finalFormat)
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
        }, innerRef)
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
          return FieldTimeRangePickerLightEdit(
            {
              ...editProps,
              lightLabel,
              open: open.value,
              setOpen,
              intl,
            },
            innerRef,
          )
        }
        return FieldTimeRangePickerEdit(editProps, innerRef)
      }
      return null
    }
  },
})

export const FieldTimeRangePicker = FieldTimeRangePickerComponent

export default FieldTimePicker
