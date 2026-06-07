import type {
  ItemType,
  ProFormRenderValueTypeHelpers,
  ProSchemaRenderValueTypeFunction,
} from '../typing'
import { dependency } from './dependency'
import { divider } from './divider'
import { field } from './field'
import { formList } from './formList'
import { formSet } from './formSet'
import { group } from './group'
import { ignore } from './ignore'

export { default as dependency } from './dependency'
export { default as divider } from './divider'
export { default as field } from './field'
export { default as formList } from './formList'
export { default as formSet } from './formSet'
export { default as group } from './group'
export { default as ignore } from './ignore'

const tasks: ProSchemaRenderValueTypeFunction<any, any>[] = [
  ignore,
  group,
  formList,
  formSet,
  divider,
  dependency,
]

export function renderValueType<DataType, ValueType>(
  item: ItemType<DataType, ValueType>,
  helpers: ProFormRenderValueTypeHelpers<DataType, ValueType>,
) {
  for (let cur = 0; cur < tasks.length; cur += 1) {
    const task = tasks[cur]
    if (!task)
      continue
    const dom = task(item, helpers)
    if (dom === true)
      continue
    return dom
  }

  return field(item, helpers)
}
