import type { FormItemProps } from 'antdv-next'
import type { InjectionKey } from 'vue'
import type { NamePath, ProFieldProps, SearchTransformKeyFn } from '../utils'
import type { ProFieldValueType } from '../utils/typing'
import type { CommonFormProps } from './BaseForm'
import type { FieldProps, ProFormGroupProps } from './typing'
import { inject, provide } from 'vue'

export type FiledContextProps = {
  fieldProps?: FieldProps<unknown>
  proFieldProps?: ProFieldProps
  formItemProps?: FormItemProps
  groupProps?: ProFormGroupProps
  model?: Record<string, any>
  setFieldValue?: (name: NamePath, value: any) => void
  setFieldValueType?: (
    name: NamePath,
    obj: {
      valueType?: ProFieldValueType
      dateFormat?: string
      transform?: SearchTransformKeyFn
    },
  ) => void
  setFieldInitialValue?: (name: NamePath, value: any) => void
  formComponentType?:
    | 'DrawerForm'
    | 'ModalForm'
    | 'QueryFilter'
    | 'LightFilter'
    | (string & {})
  formKey?: string
  getPopupContainer?: (e: HTMLElement) => HTMLElement | ParentNode
} & Pick<CommonFormProps, 'formRef' | 'grid'>

export const FieldContext: InjectionKey<FiledContextProps> = Symbol('FieldContext')

export function provideFieldContext(value: FiledContextProps) {
  provide(FieldContext, value)
}

export function useFieldContext() {
  return inject(FieldContext, {})
}

export default FieldContext
