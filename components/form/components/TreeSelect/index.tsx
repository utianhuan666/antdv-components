import type { TreeSelectProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormTreeSelectProps = ProFormFieldItemProps<
  TreeSelectProps & {
    fetchDataOnSearch?: boolean
  }
>

const ProFormTreeSelect: FunctionalComponent<ProFormTreeSelectProps> = (props, { slots }) => (
  <ProFormField valueType="treeSelect" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormTreeSelect.displayName = 'ProFormTreeSelect'
ProFormTreeSelect.inheritAttrs = false

export default ProFormTreeSelect
