import type { CascaderProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormCascaderProps = ProFormFieldItemProps<CascaderProps>

const ProFormCascader: FunctionalComponent<ProFormCascaderProps> = (props, { slots }) => (
  <ProFormField valueType="cascader" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormCascader.displayName = 'ProFormCascader'
ProFormCascader.inheritAttrs = false

export default ProFormCascader
