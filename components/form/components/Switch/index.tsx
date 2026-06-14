import type { SwitchProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import type { ComponentPublicInstance } from 'vue'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import ProFormField from '../Field'

export type ProFormSwitchProps = ProFormFieldItemProps<SwitchProps>
export const ProFormSwitch = defineComponent({
  name: 'ProFormSwitch',
  inheritAttrs: false,
  setup(_p, { attrs, expose }) {
    const innerRef = ref<ComponentPublicInstance | null>(null)
    expose(createRefProxy<ComponentPublicInstance>(innerRef))
    return () => <ProFormField ref={innerRef} {...attrs as any} valueType="switch" />
  },
})
export default ProFormSwitch
