import type { CascaderProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormCascaderProps = ProFormFieldItemProps<CascaderProps>
export const ProFormCascader = defineComponent({ name: 'ProFormCascader', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="cascader" /> })
export default ProFormCascader
