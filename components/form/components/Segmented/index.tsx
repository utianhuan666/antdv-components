import type { SegmentedProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormSegmentedProps = ProFormFieldItemProps<SegmentedProps>

const ProFormSegmented: FunctionalComponent<ProFormSegmentedProps> = (props, { slots }) => (
  <ProFormField valueType="segmented" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormSegmented.displayName = 'ProFormSegmented'
ProFormSegmented.inheritAttrs = false

export default ProFormSegmented
