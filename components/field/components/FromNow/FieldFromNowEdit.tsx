import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import { DatePicker } from 'antdv-next'
import dayjs from 'dayjs'

type Props = NonNullable<ProFieldFC<{
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}>['__props']> & {
  intl: IntlType
}

export function FieldFromNowEdit(props: Props) {
  const { text, mode, variant, formItemRender, fieldProps, intl } = props
  const fieldValue = fieldProps?.value
  const momentValue = fieldValue ? (dayjs.isDayjs(fieldValue) ? fieldValue : dayjs(fieldValue)) : undefined
  const dom = (
    <DatePicker
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
