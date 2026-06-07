import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import { renderFormItem, useRegisterFormItem } from '../_util'

export type ProFormItemProps = ProFormFieldItemProps

const ProFormItem = defineComponent({
  name: 'ProFormItem',
  inheritAttrs: false,
  setup(props: ProFormItemProps, { attrs, slots }) {
    useRegisterFormItem(() => ({ ...attrs, ...props } as ProFormItemProps))
    return () => renderFormItem({ ...attrs, ...props } as ProFormItemProps, slots.default?.())
  },
}) as any

ProFormItem.displayName = 'ProFormComponent'

export default ProFormItem
