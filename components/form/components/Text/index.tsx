import type { InputPasswordProps, InputProps, PopoverProps } from 'antdv-next'
import type { FunctionalComponent, VNodeChild } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormTextProps = ProFormFieldItemProps<InputProps>

export type PasswordStatus = 'ok' | 'pass' | 'poor' | undefined

export interface PassWordStrengthProps {
  statusRender?: (value?: string) => VNodeChild
  popoverProps?: PopoverProps
  strengthText?: VNodeChild
}

export type ProFormTextPasswordProps = ProFormFieldItemProps<InputPasswordProps & PassWordStrengthProps>

const ProFormTextBase: FunctionalComponent<ProFormTextProps> = (props, { slots }) => (
  <ProFormField valueType="text" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormTextBase.displayName = 'ProFormText'
ProFormTextBase.inheritAttrs = false

const ProFormTextPassword: FunctionalComponent<ProFormTextPasswordProps> = (props, { slots }) => (
  <ProFormField valueType="password" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormTextPassword.displayName = 'ProFormTextPassword'
ProFormTextPassword.inheritAttrs = false

const ProFormText = Object.assign(ProFormTextBase, {
  Password: ProFormTextPassword,
})

export default ProFormText
export { ProFormTextPassword }
