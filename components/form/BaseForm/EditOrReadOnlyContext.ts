import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface EditOrReadOnlyContextValue {
  /** 当前 form 是否整体只读 */
  readonly?: boolean
  /** 当前 form 模式，read 强制只读，edit 编辑 */
  mode?: 'read' | 'edit'
}

export const EditOrReadOnlyContextKey: InjectionKey<EditOrReadOnlyContextValue> = Symbol('ProEditOrReadOnlyContext')

export function provideEditOrReadOnly(value: EditOrReadOnlyContextValue) {
  provide(EditOrReadOnlyContextKey, value)
}

export function useEditOrReadOnly(): EditOrReadOnlyContextValue {
  return inject(EditOrReadOnlyContextKey, {})
}
