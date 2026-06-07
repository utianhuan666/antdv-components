import type { PropType } from 'vue'
import type { NamePath } from '../../../utils'
import { get } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProFormContext } from '../../../utils'

export interface ProFormDependencyProps {
  name: NamePath[]
  children?: any
}

export const ProFormDependency = defineComponent({
  name: 'ProFormDependency',
  props: {
    name: { type: Array as PropType<NamePath[]>, required: true },
  },
  setup(props, { slots }) {
    const context = useProFormContext<Record<string, any>>()
    return () => {
      const allValues = context.getFieldFormatValueObject?.() ?? {}
      const values = props.name.reduce<Record<string, any>>((result, itemName) => {
        const key = Array.isArray(itemName) ? itemName.join('.') : String(itemName)
        result[key] = get(allValues, Array.isArray(itemName) ? itemName : [itemName as any])
        return result
      }, {})
      return slots.default?.(values)
    }
  },
})

export default ProFormDependency
