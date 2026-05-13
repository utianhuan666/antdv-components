import type { PropType } from 'vue'
import type { NamePath } from '../../typing'
import { computed, defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { useProFormContext } from '../../ProFormContext'
import { useFormListContext } from '../List/FormListContext'

function getValueByNamePath(model: Record<string, any> | undefined, name: (string | number)[]) {
  if (!model)
    return undefined
  return name.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(target: Record<string, any>, name: NamePath, value: any) {
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  if (path.length === 1) {
    target[last] = value
    return
  }
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, target)
  parent[last] = value
}

/**
 * ProFormDependency 对标 React `src/form/components/Dependency/index.tsx`：
 * 1. 通过 `name` 声明依赖项（支持嵌套路径数组）。
 * 2. 在 ProFormList 内默认从当前行取值，`ignoreFormListField` 为 true 时改为全局取值。
 * 3. `originDependencies` 允许自定义在渲染出参中 values 的落点路径，默认与 `name` 一致。
 * 4. 默认插槽以 `(values, form)` 形式接收依赖值与 ProForm 实例。
 */
const ProFormDependency = defineComponent({
  name: 'ProFormDependency',
  props: {
    /** 依赖的字段路径列表，例如 `['name', ['name2', 'text']]` */
    name: { type: Array as PropType<NamePath[]>, required: true },
    /** 渲染出参 values 对应的落点路径，默认与 `name` 一致 */
    originDependencies: { type: Array as PropType<NamePath[]>, default: undefined },
    /** 在 ProFormList 内是否忽略行前缀，强制从表单根 model 取值 */
    ignoreFormListField: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const fieldContext = useFieldContext()
    const proFormContext = useProFormContext()
    const formListContext = useFormListContext()

    const flattenNames = computed<(string | number)[][]>(() => {
      return props.name.map((itemName) => {
        const path: any[] = [itemName]
        if (
          !props.ignoreFormListField
          && formListContext.name !== undefined
          && formListContext.listName?.length
        ) {
          path.unshift(formListContext.listName)
        }
        return path.flat(1) as (string | number)[]
      })
    })

    const values = computed(() => {
      const rootModel = fieldContext.rootModel || fieldContext.model || {}
      const originDependencies = props.originDependencies || props.name
      const result: Record<string, any> = {}
      flattenNames.value.forEach((fullName, i) => {
        const value = getValueByNamePath(rootModel, fullName)
        const originName = originDependencies[i]
        if (originName === undefined || typeof value === 'undefined')
          return
        setValueByNamePath(result, originName, value)
      })
      return result
    })

    return () => slots.default?.(values.value, proFormContext.formRef?.value) ?? null
  },
})

export default ProFormDependency
