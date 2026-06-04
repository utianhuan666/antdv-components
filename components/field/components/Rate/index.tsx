import type { RateProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldRateEdit from './FieldRateEdit'
import FieldRateRead from './FieldRateRead'

interface FieldRateFCProps {
  text: string
  fieldProps?: RateProps
}
type FieldRateProps = NonNullable<ProFieldFC<FieldRateFCProps>['__props']>

const FieldRate: ProFieldFC<FieldRateFCProps> = (props) => {
  const fieldProps = props as FieldRateProps
  const mergedProps = {
    ...fieldProps,
    text: fieldProps.text ?? '',
    mode: fieldProps.mode ?? 'read',
    fieldProps: fieldProps.fieldProps ?? {},
  }

  if (isProFieldReadMode(mergedProps.mode))
    return FieldRateRead(mergedProps, null)

  if (isProFieldEditOrUpdateMode(mergedProps.mode))
    return FieldRateEdit(mergedProps, null)

  return null
}

export default FieldRate
