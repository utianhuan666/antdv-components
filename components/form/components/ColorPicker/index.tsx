import type { ColorPickerProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormColorPickerProps = ProFormFieldItemProps<ColorPickerProps>
export const ProFormColorPicker = defineComponent({ name: 'ProFormColorPicker', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="color" /> })
export default ProFormColorPicker
