import type { FormInstance } from 'antdv-next'
import type { InjectionKey, Ref } from 'vue'
import type { NamePath } from '../../typing'
import { inject, provide } from 'vue'

export interface ProFormInstanceType<T> {
  getFieldsFormatValue?: (nameList?: true, omitNil?: boolean) => T
  getFieldFormatValue?: (nameList?: NamePath) => T
  getFieldFormatValueObject?: (nameList?: NamePath) => T
  validateFieldsReturnFormatValue?: (nameList?: NamePath[]) => Promise<T>
}

export type ProFormContextValue<T = any> = ProFormInstanceType<T> & {
  formRef?: Ref<FormInstance | undefined>
}

export const ProFormContext: InjectionKey<ProFormContextValue<any>> = Symbol('ProFormContext')

export function provideProFormContext<T>(value: ProFormContextValue<T>) {
  provide(ProFormContext, value as ProFormContextValue<any>)
}

export function useProFormContext<T = any>() {
  return inject(ProFormContext, {}) as ProFormContextValue<T>
}
