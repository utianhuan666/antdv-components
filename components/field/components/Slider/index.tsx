import type { SliderProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSliderEdit from './FieldSliderEdit'
import FieldSliderRead from './FieldSliderRead'

interface FieldSliderFCProps {
  text: string
  fieldProps?: SliderProps
}
type FieldSliderProps = NonNullable<ProFieldFC<FieldSliderFCProps>['__props']>

const FieldSlider: ProFieldFC<FieldSliderFCProps> = (props) => {
  const fieldProps = props as FieldSliderProps
  const mergedProps = {
    ...fieldProps,
    text: fieldProps.text ?? '',
    mode: fieldProps.mode ?? 'read',
    fieldProps: fieldProps.fieldProps ?? {},
  }

  if (isProFieldReadMode(mergedProps.mode))
    return FieldSliderRead(mergedProps)

  if (isProFieldEditOrUpdateMode(mergedProps.mode))
    return FieldSliderEdit(mergedProps, null)

  return null
}

export default FieldSlider
