import type { InjectionKey, ShallowRef } from 'vue'
import type { NamePath, ProFormData, ProFormInstance } from './typing'
import { inject, provide } from 'vue'

export interface ProFormContextValue<T = ProFormData> {
  formRef?: ShallowRef<ProFormInstance<T> | undefined>
  getFieldsFormatValue?: (allData?: true, omitNil?: boolean) => T
  getFieldFormatValue?: (name: NamePath, omitNil?: boolean) => any
  getFieldFormatValueObject?: (name: NamePath, omitNil?: boolean) => Partial<T>
  validateFieldsReturnFormatValue?: (
    nameList?: NamePath[],
    omitNil?: boolean,
  ) => Promise<T>
}

export const ProFormContextKey: InjectionKey<ProFormContextValue> = Symbol('ProFormContext')

export function provideProFormContext(value: ProFormContextValue) {
  provide(ProFormContextKey, value)
}

export function useProFormContext(): ProFormContextValue {
  return inject(ProFormContextKey, {})
}
