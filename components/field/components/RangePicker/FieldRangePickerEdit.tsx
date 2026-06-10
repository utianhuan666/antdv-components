import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { FieldRangePickerProps } from './types'
import { DateRangePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type DateRangePickerInstance = InstanceType<typeof import('antdv-next')['DateRangePicker']>

type Props = NonNullable<ProFieldFC<FieldRangePickerProps>['__props']> & {
  format: string
  intl: IntlType
}

export function FieldRangePickerEdit(props: Props, ref?: Ref<DateRangePickerInstance | null>) {
  const {
    text,
    mode,
    format,
    picker,
    formItemRender,
    showTime,
    intl,
    variant: propsVariant,
  } = props
  const fieldProps = props.fieldProps || {}
  const dayValue = parseValueToDay(fieldProps.value)
  const dom = (
    <DateRangePicker
      ref={ref}
      picker={picker}
      format={format}
      showTime={showTime}
      placeholder={[
        intl.getMessage('tableForm.selectPlaceholder', '请选择'),
        intl.getMessage('tableForm.selectPlaceholder', '请选择'),
      ]}
      {...fieldProps}
      variant={propsVariant ?? fieldProps?.variant}
      value={dayValue}
    />
  )
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom)
  }
  return dom
}

export default FieldRangePickerEdit
