import type { VNodeChild } from 'vue'
import type { ProFieldValueTypeInput } from '../field'

export type NamePath = string | number | (string | number)[]
export type ProFormFieldWidth = number | 'sm' | 'md' | 'xl' | 'xs' | 'lg'
export type ProFormLayoutType = 'Form' | 'ModalForm' | 'DrawerForm' | 'StepsForm' | 'QueryFilter' | 'LightFilter'

export interface ProFormGridConfig {
  /** 是否开启栅格布局 */
  grid?: boolean
  /** 在 grid 模式下生效，默认 `{ xs: 24 }` */
  colProps?: Record<string, any>
  /** 在 grid 模式下生效，默认 `{ gutter: 8 }` */
  rowProps?: Record<string, any>
}

export interface SubmitterContext {
  form?: any
  submit: () => void
  reset: () => void
}

export interface SubmitterProps {
  searchConfig?: {
    submitText?: string
    resetText?: string
  }
  submitButtonProps?: false | (Record<string, any> & { preventDefault?: boolean })
  resetButtonProps?: false | (Record<string, any> & { preventDefault?: boolean })
  onSubmit?: (value?: Record<string, any>) => void
  onReset?: (value?: Record<string, any>) => void
  /** 完全自定义按钮区域；返回 false 表示隐藏 */
  render?: false | ((props: SubmitterContext, dom: VNodeChild[]) => VNodeChild)
}

export interface CommonFormProps<T = Record<string, any>, U = Record<string, any>> extends ProFormGridConfig {
  submitter?: false | SubmitterProps
  loading?: boolean
  initialValues?: Partial<T>
  params?: U
  request?: (params: U) => Promise<Partial<T>>
  syncToUrl?: boolean | ((values: T, type: 'get' | 'set') => T)
  syncToUrlAsImportant?: boolean
  extraUrlParams?: Record<string, any>
  syncToInitialValues?: boolean
  omitNil?: boolean
  dateFormatter?: string | 'string' | 'number' | false | ((value: any, valueType: string) => string | number)
  isKeyPressSubmit?: boolean
  autoFocusFirstInput?: boolean
  formKey?: string
  /** 全局只读模式，所有表单项默认 readonly，单个表单项 readonly 优先 */
  readonly?: boolean
  onFinish?: (formData: T) => Promise<boolean | void> | boolean | void
  onReset?: (formData: T) => void
  onLoadingChange?: (loading: boolean) => void
  onInit?: (values: T, form: any) => void
}

export interface BaseFormProps<T = Record<string, any>, U = Record<string, any>> extends CommonFormProps<T, U> {
  /** 自定义内容渲染（items + submitter），用于 layouts/QueryFilter 等扩展 */
  contentRender?: (items: VNodeChild, submitter: VNodeChild | undefined, form: any) => VNodeChild
  fieldProps?: Record<string, any>
  proFieldProps?: Record<string, any>
  formItemProps?: Record<string, any>
  groupProps?: ProFormGroupProps
  formComponentType?: ProFormLayoutType | (string & {})
  component?: false | string
  size?: string
  layout?: 'horizontal' | 'vertical' | 'inline'
  model?: T
  name?: string
  labelCol?: Record<string, any>
  wrapperCol?: Record<string, any>
}

export interface ProFormProps<T = Record<string, any>, U = Record<string, any>> extends BaseFormProps<T, U> {}

export interface ProFormGroupProps extends ProFormGridConfig {
  title?: VNodeChild
  collapsible?: boolean
  defaultCollapsed?: boolean
  labelLayout?: 'inline' | 'twoLine'
  extra?: VNodeChild
  style?: Record<string, any>
}

export interface ProFormItemProps {
  name?: NamePath
  label?: VNodeChild
  tooltip?: VNodeChild
  rules?: any[]
  required?: boolean
  valuePropName?: string
  initialValue?: any
  valueType?: ProFieldValueTypeInput
  dataFormat?: string
  /** 提交时转换 */
  transform?: (value: any, namePath: NamePath) => any
  /** 取值时转换 */
  convertValue?: (value: any, namePath: NamePath) => any
  /** 透传到 antdv FormItem */
  formItemProps?: Record<string, any>
  /** 是否跳过外层 FormItem，仅渲染受控控件 */
  ignoreFormItem?: boolean
}

export interface ProFormItemCreateConfig extends ProFormItemProps {
  valueType?: ProFieldValueTypeInput
  customLightMode?: boolean
  defaultProps?: Record<string, any>
  ignoreWidth?: boolean
}

export interface ProFormFieldSetProps<T = any> extends ProFormItemProps {
  value?: T[]
  fieldProps?: Record<string, any>
  space?: Record<string, any>
  type?: 'space' | 'group'
}

export interface ProFormUploadButtonProps<T = Record<string, any>> extends ProFormFieldItemProps<T> {
  icon?: VNodeChild
  title?: VNodeChild
  max?: number
  value?: any[]
  fileList?: any[]
  buttonProps?: Record<string, any>
  imageProps?: Record<string, any>
  action?: string | ((file: any) => Promise<string>)
  accept?: string
  listType?: string
}

export interface ProFormUploadDraggerProps<T = Record<string, any>> extends ProFormFieldItemProps<T> {
  icon?: VNodeChild
  title?: VNodeChild
  description?: VNodeChild
  max?: number
  value?: any[]
  action?: string | ((file: any) => Promise<string>)
  accept?: string
}

export interface ProFormFieldItemProps<T = Record<string, any>> extends ProFormItemProps, ProFormGridConfig {
  fieldProps?: Partial<T> & Record<string, any>
  placeholder?: string | string[]
  secondary?: boolean
  emptyText?: VNodeChild
  cacheForSwr?: boolean
  disabled?: boolean
  width?: ProFormFieldWidth
  proFieldProps?: Record<string, any>
  readonly?: boolean
  valueType?: ProFieldValueTypeInput
  valueEnum?: Record<string, any> | Map<any, any>
  request?: (...args: any[]) => Promise<any[]>
  params?: Record<string, any>
  allowClear?: boolean
  children?: VNodeChild
  fieldConfig?: ProFormItemCreateConfig
}
