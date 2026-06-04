import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldImageEdit from './FieldImageEdit'
import FieldImageRead from './FieldImageRead'

export type { FieldImageProps }

type FieldImageFieldProps = NonNullable<ProFieldFC<FieldImageProps>['__props']>

const FieldImage: ProFieldFC<FieldImageProps> = (props) => {
  const typedProps = props as FieldImageFieldProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'

  if (isProFieldReadMode(mode)) {
    return FieldImageRead({
      text,
      mode,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
      width: typedProps.width,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    const placeholderValue = (Array.isArray(typedProps.placeholder) ? typedProps.placeholder[0] : typedProps.placeholder) || '请输入'
    return FieldImageEdit({
      text,
      mode,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
      placeholderValue,
    })
  }

  return null
}

export default FieldImage
