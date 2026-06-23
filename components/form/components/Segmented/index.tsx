import type { SegmentedProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import type { ComponentPublicInstance } from 'vue'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import ProFormField from '../Field'

export type ProFormSegmentedProps = ProFormFieldItemProps<SegmentedProps>
export const ProFormSegmented = defineComponent({
  name: 'ProFormSegmented',
  inheritAttrs: false,
  setup(_p, { attrs, expose }) {
    const innerRef = ref<ComponentPublicInstance | null>(null)
    expose(createRefProxy<ComponentPublicInstance>(innerRef))
    return () => <ProFormField ref={innerRef} {...attrs as any} valueType="segmented" />
  },
})
export default ProFormSegmented
