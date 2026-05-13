import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/**
 * 对标 React `FormListContext`，供 ProFormDependency、行内字段读取当前所在 ProFormList 行的元信息。
 * - `listName`：当前行的完整字段路径（含外层列表前缀和当前行索引），例如 `['default', 'users', 0]`
 * - `name`：当前行索引
 * - `key`：当前行 key（与 `name` 对齐）
 */
export interface FormListContextValue {
  listName?: (string | number)[]
  name?: number
  key?: number
}

export const FormListContextKey: InjectionKey<FormListContextValue> = Symbol('ProFormListContext')

export function provideFormListContext(value: FormListContextValue) {
  provide(FormListContextKey, value)
}

export function useFormListContext(): FormListContextValue {
  return inject(FormListContextKey, {})
}
