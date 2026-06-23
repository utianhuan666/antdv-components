import type { InputPasswordProps, InputProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineProFormField } from '../FormItem/warpField'

export type ProFormTextProps = ProFormFieldItemProps<InputProps>
export type ProFormTextPasswordProps = ProFormFieldItemProps<InputPasswordProps>

const ProFormText = defineProFormField('ProFormText', 'text') as any
const Password = defineProFormField('ProFormTextPassword', 'password')

ProFormText.Password = Password

export default ProFormText as typeof ProFormText & {
  Password: typeof Password
}
