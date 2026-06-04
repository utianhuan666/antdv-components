import type { SelectProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormSelectProps = ProFormFieldItemProps<
  SelectProps & {
    searchOnFocus?: boolean
    resetAfterSelect?: boolean
    fetchDataOnSearch?: boolean
  }
> & {
  options?: SelectProps['options'] | string[]
  mode?: SelectProps['mode'] | 'single'
  showSearch?: SelectProps['showSearch']
  readonly?: boolean
  onChange?: SelectProps['onChange']
}

const ProFormSelect: FunctionalComponent<ProFormSelectProps> = (props, { slots }) => (
  <ProFormField valueType="select" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormSelect.displayName = 'ProFormSelect'
ProFormSelect.inheritAttrs = false

const ProFormSearchSelect: FunctionalComponent<ProFormSelectProps> = (props, { slots }) => {
  const { fieldProps, mode, options, ...rest } = props
  const finalMode = fieldProps?.mode || mode || 'multiple'
  return (
    <ProFormField
      valueType="select"
      fieldConfig={{ valueType: 'select', customLightMode: true }}
      fieldProps={{
        options,
        labelInValue: true,
        showSearch: true,
        suffixIcon: null,
        autoClearSearchValue: true,
        optionLabelProp: 'label',
        ...fieldProps,
        mode: finalMode === 'single' ? undefined : finalMode,
      }}
      {...rest}
    >
      {slots.default?.()}
    </ProFormField>
  )
}

ProFormSearchSelect.displayName = 'ProFormSearchSelect'
ProFormSearchSelect.inheritAttrs = false

const WrappedProFormSelect = Object.assign(ProFormSelect, {
  SearchSelect: ProFormSearchSelect,
})

export default WrappedProFormSelect
export { ProFormSearchSelect }
