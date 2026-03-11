import type { FormItemProps, FormItemSlots } from 'antdv-next'
import type { SlotsType } from 'vue'
import { FormItem } from 'antdv-next'
import { defineComponent } from 'vue'

export const MyFormItem = defineComponent<FormItemProps, { test: () => void }, string, SlotsType<FormItemSlots>>(
  (props, { slots }) => {
    return () => {
      return <FormItem {...props} v-slots={slots} />
    }
  },
  {
    name: 'MyFormItem',
  },
)
