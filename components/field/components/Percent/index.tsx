import type { ProFieldFC } from '../../types'
import type { PercentPropInt } from './types'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPercentEdit from './FieldPercentEdit'
import FieldPercentRead from './FieldPercentRead'
import { toNumber } from './util'

export type { PercentPropInt }
type FieldPercentProps = NonNullable<ProFieldFC<PercentPropInt>['__props']>

const FieldPercent: ProFieldFC<PercentPropInt> = (props) => {
  const {
    text = '',
    mode = 'read',
    render,
    formItemRender,
    fieldProps = {},
    placeholder,
    prefix,
    suffix = '%',
    precision,
    showColor = false,
    showSymbol: propsShowSymbol,
  } = props as FieldPercentProps
  const intl = useIntl()

  const realValue = typeof text === 'string' && text.includes('%')
    ? toNumber(text.replace('%', ''))
    : toNumber(text)

  const showSymbol = typeof propsShowSymbol === 'function'
    ? propsShowSymbol(text)
    : propsShowSymbol

  const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')

  if (isProFieldReadMode(mode)) {
    return FieldPercentRead({
      text,
      mode,
      render,
      formItemRender,
      fieldProps,
      placeholder,
      prefix,
      suffix,
      precision,
      showColor,
      showSymbol,
      realValue,
    })
  }

  if (isProFieldEditOrUpdateMode(mode)) {
    return FieldPercentEdit({
      text,
      mode,
      render,
      formItemRender,
      fieldProps,
      placeholder,
      prefix,
      suffix,
      precision,
      showColor,
      showSymbol: propsShowSymbol,
      placeholderValue,
    })
  }

  return null
}

export default FieldPercent
