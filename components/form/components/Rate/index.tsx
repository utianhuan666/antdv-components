import type { RateProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import type { ComponentPublicInstance } from 'vue'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import ProFormField from '../Field'

export type ProFormRateProps = ProFormFieldItemProps<RateProps>
export const ProFormRate = defineComponent({
  name: 'ProFormRate',
  inheritAttrs: false,
  setup(_p, { attrs, expose }) {
    const innerRef = ref<ComponentPublicInstance | null>(null)
    expose(createRefProxy<ComponentPublicInstance>(innerRef))
    return () => <ProFormField ref={innerRef} {...attrs as any} valueType="rate" />
  },
})
export default ProFormRate
