import type { PropType } from 'vue'
import type { NamePath } from '../../../utils'
import { get } from '@v-c/util'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProFormContext } from '../../../utils'

export interface ProFormDependencyProps {
  name: NamePath[]
  shouldUpdate?: boolean | ((prevValues: any, nextValues: any) => boolean)
  children?: any
}

export const ProFormDependency = defineComponent({
  name: 'ProFormDependency',
  props: {
    name: { type: Array as PropType<NamePath[]>, required: true },
    shouldUpdate: { type: [Boolean, Function] as PropType<boolean | ((prev: any, next: any) => boolean)> },
  },
  setup(props, { slots }) {
    const context = useProFormContext<Record<string, any>>()

    // Compute values from form
    const computeValues = () => {
      const allValues = context.getFieldFormatValueObject?.() ?? {}
      return props.name.reduce<Record<string, any>>((result, itemName) => {
        const key = Array.isArray(itemName) ? itemName.join('.') : String(itemName)
        result[key] = get(allValues, Array.isArray(itemName) ? itemName : [itemName as any])
        return result
      }, {})
    }

    // Store values in a ref that updates based on shouldUpdate
    const cachedValues = ref(computeValues())

    // Watch form values and update cache when shouldUpdate allows
    const allValues = computed(() => context.getFieldFormatValueObject?.() ?? {})

    watch(allValues, (newAllValues, oldAllValues) => {
      const newValues = computeValues()

      // If no shouldUpdate prop, always update (default behavior)
      if (props.shouldUpdate === undefined) {
        cachedValues.value = newValues
        return
      }

      // If shouldUpdate is false, never update
      if (props.shouldUpdate === false) {
        return
      }

      // If shouldUpdate is true, always update
      if (props.shouldUpdate === true) {
        cachedValues.value = newValues
        return
      }

      // If shouldUpdate is a function, call it to decide
      if (typeof props.shouldUpdate === 'function') {
        if (props.shouldUpdate(oldAllValues, newAllValues)) {
          cachedValues.value = newValues
        }
      }
    }, { deep: true })

    return () => {
      return slots.default?.(cachedValues.value)
    }
  },
})

export default ProFormDependency
