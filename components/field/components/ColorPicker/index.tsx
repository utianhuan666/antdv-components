import type { ColorPickerProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldColorPickerEdit from './FieldColorPickerEdit'
import FieldColorPickerRead from './FieldColorPickerRead'

type FieldColorPickerProps = NonNullable<ProFieldFC<
  {
    text: string
    mode?: 'read' | 'edit' | 'update'
  } & Partial<Omit<ColorPickerProps, 'value' | 'mode'>>
>['__props']>

type FieldColorPickerOwnProps = {
  text: string
  mode?: 'read' | 'edit' | 'update'
} & Partial<Omit<ColorPickerProps, 'value' | 'mode'>>

const FieldColorPicker: ProFieldFC<FieldColorPickerOwnProps> = (props) => {
  const typedProps = props as FieldColorPickerProps
  const text = typedProps.text ?? ''
  const mode = typedProps.mode ?? 'read'

  if (isProFieldReadMode(mode)) {
    return FieldColorPickerRead({
      text,
      mode,
      render: typedProps.render,
      fieldProps: typedProps.fieldProps,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldColorPickerEdit({
      text,
      mode,
      formItemRender: typedProps.formItemRender,
      fieldProps: typedProps.fieldProps,
    })
  }

  return null
}

export default FieldColorPicker
