import type { ProFieldFC } from '../../types'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextAreaEdit from './FieldTextAreaEdit'
import FieldTextAreaRead from './FieldTextAreaRead'

type FieldTextAreaProps = NonNullable<ProFieldFC<{
  text: string | number
}>['__props']>

const FieldTextArea: ProFieldFC<{
  text: string | number
}> = (props) => {
  const typedProps = props as FieldTextAreaProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'
  const intl = useIntl()

  if (isProFieldReadMode(mode)) {
    return FieldTextAreaRead({
      text,
      mode,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
      emptyText: typedProps.emptyText ?? '-',
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldTextAreaEdit({
      text,
      mode,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
      intl,
    })
  }

  return null
}

export default FieldTextArea
