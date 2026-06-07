import type { SwitchProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormSwitchProps = ProFormFieldItemProps<SwitchProps>
export const ProFormSwitch = defineComponent({ name: 'ProFormSwitch', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="switch" /> })
export default ProFormSwitch
