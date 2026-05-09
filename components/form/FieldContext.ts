import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface FieldContextValue {
  /** 当前 BaseForm 实例，便于子组件访问 form 方法 */
  formInstance?: any
  /** 当前响应式 model，子字段读取/写入它 */
  model?: Record<string, any>
  /** 全局 fieldProps，会被字段自身 fieldProps 合并 */
  fieldProps?: Record<string, any>
  /** 全局 formItemProps，会被字段自身 formItemProps 合并 */
  formItemProps?: Record<string, any>
  /** 透传给 ProField 的 props，例如 readonly */
  proFieldProps?: Record<string, any>
  /** 是否处于 grid 布局 */
  grid?: boolean
  /** 透传 col/row props 到 Group */
  colProps?: Record<string, any>
  rowProps?: Record<string, any>
  /** 表单实例 key，便于 SWR 缓存 */
  formKey?: string
  /** 弹窗类 form 容器获取函数 */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement
  /** 当前 BaseForm 是否处于 loading */
  loading?: boolean
}

export const FieldContextKey: InjectionKey<FieldContextValue> = Symbol('ProFieldContext')

export function provideFieldContext(value: FieldContextValue) {
  provide(FieldContextKey, value)
}

export function useFieldContext(): FieldContextValue {
  return inject(FieldContextKey, {})
}
