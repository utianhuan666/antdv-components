import type { TextAreaProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormTextAreaProps = ProFormFieldItemProps<TextAreaProps>

const ProFormTextArea: FunctionalComponent<ProFormTextAreaProps> = (props, { slots }) => (
  <ProFormField valueType="textarea" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormTextArea.displayName = 'ProFormTextArea'
ProFormTextArea.inheritAttrs = false

export default ProFormTextArea
