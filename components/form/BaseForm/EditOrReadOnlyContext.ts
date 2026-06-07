import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface EditOrReadOnlyContextValue {
  mode?: 'edit' | 'read' | 'update'
}

export const EditOrReadOnlyContext: InjectionKey<EditOrReadOnlyContextValue> = Symbol('EditOrReadOnlyContext')

export function provideEditOrReadOnlyContext(value: EditOrReadOnlyContextValue) {
  provide(EditOrReadOnlyContext, value)
}

export function useEditOrReadOnlyContext() {
  return inject(EditOrReadOnlyContext, {})
}
