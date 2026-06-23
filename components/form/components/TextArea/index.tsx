import type { TextAreaProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import type { ComponentPublicInstance } from 'vue'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import ProFormField from '../Field'

export type ProFormTextAreaProps = ProFormFieldItemProps<TextAreaProps>

export const ProFormTextArea = defineComponent({
  name: 'ProFormTextArea',
  inheritAttrs: false,
  setup(_props, { attrs, slots, expose }) {
    const innerRef = ref<ComponentPublicInstance | null>(null)
    expose(createRefProxy<ComponentPublicInstance>(innerRef))
    return () => <ProFormField ref={innerRef} {...attrs as any} valueType="textarea">{slots.default?.()}</ProFormField>
  },
})

export default ProFormTextArea
