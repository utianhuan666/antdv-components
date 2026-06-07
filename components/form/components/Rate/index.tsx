import type { RateProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormRateProps = ProFormFieldItemProps<RateProps>
export const ProFormRate = defineComponent({ name: 'ProFormRate', inheritAttrs: false, setup: (_p, { attrs }) => () => <ProFormField {...attrs as any} valueType="rate" /> })
export default ProFormRate
