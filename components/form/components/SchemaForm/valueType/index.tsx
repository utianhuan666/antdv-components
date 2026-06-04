import type { ItemType, ProFormRenderValueTypeHelpers, ProSchemaRenderValueTypeFunction } from '../typing'
import { dependency } from './dependency'
import { divider } from './divider'
import { field } from './field'
import { formList } from './formList'
import { formSet } from './formSet'
import { group } from './group'
import { ignore } from './ignore'

const tasks: ProSchemaRenderValueTypeFunction<any, any>[] = [
  ignore,
  group,
  formList,
  formSet,
  divider,
  dependency,
]

export function renderValueType<T, ValueType>(
  item: ItemType<T, ValueType>,
  helpers: ProFormRenderValueTypeHelpers<T, ValueType>,
) {
  for (const task of tasks) {
    const dom = task(item, helpers)
    if (dom === true)
      continue
    return dom
  }

  return field(item as any, helpers as any)
}
