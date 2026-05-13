import type { PropType } from 'vue'
import type { NamePath } from '../../typing'
import { computed, defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'

function getValueByNamePath(model: Record<string, any>, name: NamePath) {
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(target: Record<string, any>, name: NamePath, value: any) {
  const path = Array.isArray(name) ? name : [name]
  const first = path[0]
  if (first === undefined)
    return
  if (path.length === 1) {
    target[first] = value
    return
  }
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, target)
  parent[last] = value
}

const ProFormDependency = defineComponent({
  name: 'ProFormDependency',
  props: {
    name: { type: Array as PropType<NamePath[]>, required: true },
  },
  setup(props, { slots }) {
    const fieldContext = useFieldContext()
    const values = computed(() => {
      return props.name.reduce<Record<string, any>>((result, item) => {
        setValueByNamePath(result, item, getValueByNamePath(fieldContext.model || {}, item))
        return result
      }, {})
    })

    return () => slots.default?.(values.value) ?? null
  },
})

export default ProFormDependency
