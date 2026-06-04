import type { InjectionKey } from 'vue'
import type { ProFieldPropsType, ProFieldValueTypeInput } from '../field'
import type {
  BaseFormProps,
  FieldProps,
  NamePath,
  ProFormData,
  ProFormGroupProps,
  ProFormInstance,
  SearchTransformKeyFn,
} from './typing'
import { inject, provide } from 'vue'

export interface FieldContextValue {
  /** 当前 BaseForm 实例，便于子组件访问 form 方法 */
  formInstance?: ProFormInstance
  /** 当前响应式 model，子字段读取/写入它 */
  model?: ProFormData
  /**
   * 表单根 model。在 ProFormList 行内部，`model` 会被替换为当前行 record，
   * `rootModel` 始终指向 BaseForm 顶层 model，供 ProFormDependency 等跨行读取使用。
   */
  rootModel?: ProFormData
  /** 全局 fieldProps，会被字段自身 fieldProps 合并 */
  fieldProps?: FieldProps
  /** 全局 formItemProps，会被字段自身 formItemProps 合并 */
  formItemProps?: BaseFormProps['formItemProps']
  /** 透传给 ProField 的 props，例如 readonly */
  proFieldProps?: ProFieldPropsType
  groupProps?: ProFormGroupProps
  formComponentType?: BaseFormProps['formComponentType']
  /** 是否处于 grid 布局 */
  grid?: boolean
  /** 透传 col/row props 到 Group */
  colProps?: BaseFormProps['colProps']
  rowProps?: BaseFormProps['rowProps']
  /** 表单实例 key，便于 SWR 缓存 */
  formKey?: string
  /** 弹窗类 form 容器获取函数 */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ParentNode
  /** 当前 BaseForm 是否处于 loading */
  loading?: boolean
  setFieldValueType?: (
    name: NamePath,
    config: {
      valueType?: ProFieldValueTypeInput
      dateFormat?: string
      transform?: SearchTransformKeyFn
    },
  ) => void
  clearFieldValueType?: (name: NamePath) => void
}

export const FieldContextKey: InjectionKey<FieldContextValue> = Symbol('ProFieldContext')

export function provideFieldContext(value: FieldContextValue) {
  provide(FieldContextKey, value)
}

export function useFieldContext(): FieldContextValue {
  return inject(FieldContextKey, {})
}
