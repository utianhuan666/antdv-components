import type { ColorPickerProps, PopoverProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormColorPickerProps = ProFormFieldItemProps<ColorPickerProps> & {
  popoverProps?: PopoverProps
  colors?: string[]
}

const ProFormColorPicker: FunctionalComponent<ProFormColorPickerProps> = (props, { slots }) => (
  <ProFormField valueType="color" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormColorPicker.displayName = 'ProFormColorPicker'
ProFormColorPicker.inheritAttrs = false

export default ProFormColorPicker
