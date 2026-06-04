import type { ProFieldFC } from '../../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldFromNowEdit from './FieldFromNowEdit'
import FieldFromNowRead from './FieldFromNowRead'

dayjs.extend(relativeTime)

type FieldFromNowProps = NonNullable<ProFieldFC<{
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}>['__props']>

type FieldFromNowOwnProps = {
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}

const FieldFromNow: ProFieldFC<FieldFromNowOwnProps> = (props) => {
  const typedProps = props as FieldFromNowProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'

  if (isProFieldReadMode(mode)) {
    return FieldFromNowRead({
      text,
      mode,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
      format: typedProps.format,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldFromNowEdit({
      text,
      mode,
      variant: typedProps.variant,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
    })
  }

  return null
}

export default FieldFromNow
