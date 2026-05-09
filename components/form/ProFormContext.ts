import type { InjectionKey, ShallowRef } from 'vue'
import { inject, provide } from 'vue'

export interface ProFormContextValue {
  formRef?: ShallowRef<any>
  getFieldsFormatValue?: (allData?: true, omitNil?: boolean) => Record<string, any>
  getFieldFormatValue?: (name: string | number | (string | number)[], omitNil?: boolean) => any
  getFieldFormatValueObject?: (name: string | number | (string | number)[], omitNil?: boolean) => Record<string, any>
  validateFieldsReturnFormatValue?: (
    nameList?: (string | number | (string | number)[])[],
    omitNil?: boolean,
  ) => Promise<Record<string, any>>
}

export const ProFormContextKey: InjectionKey<ProFormContextValue> = Symbol('ProFormContext')

export function provideProFormContext(value: ProFormContextValue) {
  provide(ProFormContextKey, value)
}

export function useProFormContext(): ProFormContextValue {
  return inject(ProFormContextKey, {})
}
