import type { TreeSelectProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormTreeSelectProps<T = any> = ProFormFieldItemProps<TreeSelectProps<T>>
export const ProFormTreeSelect = defineComponent({ name: 'ProFormTreeSelect', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="treeSelect" /> })
export default ProFormTreeSelect
