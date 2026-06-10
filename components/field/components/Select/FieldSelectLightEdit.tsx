import type { SelectProps } from 'antdv-next'
import type { Ref } from 'vue'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { LightSelectExpose } from './LightSelect'
import type { FieldSelectFullProps } from './FieldSelectSearchEdit'
import type { RequestOptionsType } from './types'
import LightSelect from './LightSelect'

export type FieldSelectLightEditProps = NonNullable<ProFieldFC<FieldSelectFullProps>['__props']> & {
  intl: IntlType
  loading: boolean
  options: RequestOptionsType[]
  fetchData: (keyWord?: string) => void
  resetData: () => void
  inputRef: Ref<LightSelectExpose | null>
  componentSize: SelectProps['size']
}

export function FieldSelectLightEdit(props: FieldSelectLightEditProps) {
  const {
    mode,
    formItemRender,
    fieldProps,
    id,
    label,
    variant,
    lightLabel,
    labelTrigger,
    intl,
    loading,
    options,
    fetchData,
    inputRef,
    componentSize,
    ...rest
  } = props

  const dom = (
    <LightSelect
      id={id}
      ref={inputRef}
      loading={loading}
      allowClear
      size={componentSize}
      options={options}
      label={label}
      labelVariant={variant}
      placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
      lightLabel={lightLabel}
      labelTrigger={labelTrigger}
      fetchData={fetchData}
      {...fieldProps}
    />
  )

  if (formItemRender) {
    return formItemRender(
      rest.text,
      { mode, ...fieldProps, options, loading },
      dom,
    ) ?? null
  }
  return dom
}

export default FieldSelectLightEdit
