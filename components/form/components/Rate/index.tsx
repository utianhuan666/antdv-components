import type { RateProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormRateProps = ProFormFieldItemProps<RateProps>

const ProFormRate: FunctionalComponent<ProFormRateProps> = (props, { slots }) => (
  <ProFormField valueType="rate" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormRate.displayName = 'ProFormRate'
ProFormRate.inheritAttrs = false

export default ProFormRate
