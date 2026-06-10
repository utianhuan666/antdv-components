import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { DatePicker } from 'antdv-next'
import { parseValueToDay } from '../../../utils'

type DatePickerInstance = InstanceType<typeof import('antdv-next')['DatePicker']>

type Props = NonNullable<ProFieldFC<{
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}>['__props']> & {
  intl: IntlType
}

export function FieldFromNowEdit(props: Props, ref?: Ref<DatePickerInstance | null>) {
  const { text, mode, variant, formItemRender, fieldProps, intl } = props
  const momentValue = parseValueToDay(fieldProps?.value) as any
  const dom = (
    <DatePicker
      ref={ref}
      placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
      showTime
      variant={variant ?? fieldProps?.variant ?? 'outlined'}
      {...fieldProps}
      value={momentValue}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldFromNowEdit
