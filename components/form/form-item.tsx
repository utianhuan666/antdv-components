import type { FormItemEmits, FormItemProps, FormItemSlots } from 'antdv-next'
import type { SlotsType } from 'vue'
import { FormItem } from 'antdv-next'
import { defineComponent } from 'vue'

export const MyFormItem = defineComponent<
  FormItemProps,
  FormItemEmits,
  string,
  SlotsType<FormItemSlots>
>(
  (props, { slots }) => {
    return () => {
      return <FormItem {...props} v-slots={slots} />
    }
  },
  {
    name: 'MyFormItem',
  },
)
