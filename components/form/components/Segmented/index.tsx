import type { SegmentedProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormSegmentedProps = ProFormFieldItemProps<SegmentedProps>
export const ProFormSegmented = defineComponent({ name: 'ProFormSegmented', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="segmented" /> })
export default ProFormSegmented
