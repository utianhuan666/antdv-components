import type { SwitchProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import ProFormField from '../Field'

export type ProFormSwitchProps = Omit<ProFormFieldItemProps<SwitchProps>, 'emptyText'> & {
  checkedChildren?: SwitchProps['checkedChildren']
  unCheckedChildren?: SwitchProps['unCheckedChildren']
}

const ProFormSwitch: FunctionalComponent<ProFormSwitchProps> = (props, { slots }) => (
  <ProFormField valueType="switch" valuePropName="checked" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormSwitch.displayName = 'ProFormSwitch'
ProFormSwitch.inheritAttrs = false

export default ProFormSwitch
