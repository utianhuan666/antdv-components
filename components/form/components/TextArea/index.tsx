import type { TextAreaProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import ProFormField from '../Field'

export type ProFormTextAreaProps = ProFormFieldItemProps<TextAreaProps>

export const ProFormTextArea = defineComponent({
  name: 'ProFormTextArea',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => <ProFormField {...attrs as any} valueType="textarea">{slots.default?.()}</ProFormField>
  },
})

export default ProFormTextArea
