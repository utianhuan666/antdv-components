import type { ProFieldFC } from '../../types'
import { proTheme } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldCodeEdit from './FieldCodeEdit'
import FieldCodeRead from './FieldCodeRead'
import { languageFormat } from './utils'

type FieldCodeProps = NonNullable<ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}>['__props']>

const FieldCode: ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}> = (props) => {
  const typedProps = props as FieldCodeProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'
  const language = typedProps.language ?? 'text'
  const code = languageFormat(text, language)
  const { token } = proTheme.useToken()

  if (isProFieldReadMode(mode)) {
    return FieldCodeRead({
      text,
      code,
      mode,
      language,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
      token: token.value,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldCodeEdit({
      text,
      code,
      mode,
      language,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
    })
  }

  return null
}

export default FieldCode
