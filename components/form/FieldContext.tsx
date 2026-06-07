import type { FormItemProps } from 'antdv-next'
import type { InjectionKey, Ref } from 'vue'
import type { NamePath, ProFieldProps } from '../utils'
import type { ProFormGridConfig, ProFormGroupProps } from './typing'
import { inject, provide } from 'vue'

export interface FiledContextProps extends ProFormGridConfig {
  rootModel?: Record<string, any>
  model?: Record<string, any>
  fieldProps?: Record<string, any>
  proFieldProps?: ProFieldProps
  formItemProps?: FormItemProps
  groupProps?: ProFormGroupProps
  setFieldValueType?: (name: NamePath, obj: { valueType?: any, dateFormat?: string, transform?: any }) => void
  setFieldValue?: (name: NamePath, value: any) => void
  onValuesChange?: (changedValues: Record<string, any>, values: Record<string, any>) => void
  formComponentType?: 'DrawerForm' | 'ModalForm' | 'QueryFilter' | 'LightFilter'
  formKey?: string
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  formRef?: Ref<any>
}

export const FieldContext: InjectionKey<FiledContextProps> = Symbol('FieldContext')

export function provideFieldContext(value: FiledContextProps) {
  provide(FieldContext, value)
}

export function useFieldContext() {
  return inject(FieldContext, {})
}

export default FieldContext
