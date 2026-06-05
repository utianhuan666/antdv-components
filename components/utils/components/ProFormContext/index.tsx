import type { FormInstance } from 'antdv-next'
import type { InjectionKey, Ref } from 'vue'
import type { NamePath } from '../../typing'
import { inject, provide } from 'vue'

export interface ProFormInstanceType<T> {
  getFieldsFormatValue?: (allData?: true, omitNil?: boolean) => T
  getFieldFormatValue?: (name: NamePath, omitNil?: boolean) => any
  getFieldFormatValueObject?: (name: NamePath, omitNil?: boolean) => Partial<T>
  validateFieldsReturnFormatValue?: (nameList?: NamePath[], omitNil?: boolean) => Promise<T>
}

export type ProFormContextValue<T = any> = ProFormInstanceType<T> & {
  formRef?: Ref<(Partial<FormInstance> & Record<string, any>) | undefined>
}

export const ProFormContext: InjectionKey<ProFormContextValue<any>> = Symbol('ProFormContext')

export function provideProFormContext<T>(value: ProFormContextValue<T>) {
  provide(ProFormContext, value as ProFormContextValue<any>)
}

export function useProFormContext<T = any>() {
  return inject(ProFormContext, {}) as ProFormContextValue<T>
}
