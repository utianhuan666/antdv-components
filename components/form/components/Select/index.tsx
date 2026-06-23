import type { SelectProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormSelectProps
  = Omit<ProFormFieldItemProps<SelectProps>, 'mode'> & {
    options?: SelectProps['options'] | string[]
    mode?: SelectProps['mode'] | 'single'
    showSearch?: SelectProps['showSearch']
    readonly?: boolean
    onChange?: (...args: any[]) => void
  }

const ProFormSelect = defineProFormField<ProFormSelectProps>(
  'ProFormSelect',
  'select',
  props => ({
    options: props.options,
    mode: (props as any).mode === 'single' ? undefined : (props as any).mode,
    showSearch: props.showSearch,
  }),
) as any

const SearchSelect = defineProFormField<ProFormSelectProps>(
  'ProFormSearchSelect',
  'select',
  (props) => {
    const finalMode = (props.fieldProps as any)?.mode || (props as any).mode || 'multiple'
    return {
      options: props.options,
      labelInValue: true,
      showSearch: true,
      suffixIcon: null,
      autoClearSearchValue: true,
      optionLabelProp: 'label',
      mode: finalMode === 'single' ? undefined : finalMode,
    }
  },
)

ProFormSelect.SearchSelect = SearchSelect

export default ProFormSelect as typeof ProFormSelect & {
  SearchSelect: typeof SearchSelect
}
