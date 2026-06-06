import type {
  ButtonProps,
  ColProps,
  FormInstance,
  FormItemProps,
  FormProps,
  RowProps,
  SpaceProps,
} from 'antdv-next'
import type { CSSProperties, ShallowRef, VNodeChild } from 'vue'
import type { ProFieldPropsType, ProFieldValueTypeInput, ProRenderFieldPropsType } from '../field'

export type NamePath = string | number | (string | number)[]
export type ProFormFieldWidth = number | 'sm' | 'md' | 'xl' | 'xs' | 'lg'
export type ProFormLayoutType = 'Form' | 'ModalForm' | 'DrawerForm' | 'StepsForm' | 'QueryFilter' | 'LightFilter'
export type ProFormData = Record<string, any>
export type FormData = ProFormData
export type SearchTransformKeyFn = (value: any, namePath: NamePath, allValues?: ProFormData) => any
export type SearchConvertKeyFn = (value: any, namePath: NamePath) => any

export interface ProFormGridConfig {
  /** 是否开启栅格布局 */
  grid?: boolean
  /** 在 grid 模式下生效，默认 `{ xs: 24 }` */
  colProps?: ColProps
  /** 在 grid 模式下生效，默认 `{ gutter: 8 }` */
  rowProps?: RowProps
}

export interface ProFormInstance<T = ProFormData> extends Partial<FormInstance> {
  getFieldsFormatValue?: (allData?: true, omitNil?: boolean) => T
  getFieldFormatValue?: (name: NamePath, omitNil?: boolean) => any
  getFieldFormatValueObject?: (name: NamePath, omitNil?: boolean) => Partial<T>
  validateFieldsReturnFormatValue?: (nameList?: NamePath[], omitNil?: boolean) => Promise<T>
}

export interface FormRefLike {
  readonly formInstance?: unknown
  readonly nativeElement?: HTMLFormElement
  submit?: () => void
  reset?: () => void
  getFieldsValue?: () => FormData
  getFieldValue?: (name: NamePath) => unknown
  getFieldsFormatValue?: (allData?: true, omitNil?: boolean) => FormData
  getFieldFormatValue?: (name: NamePath, omitNil?: boolean) => unknown
  getFieldFormatValueObject?: (name: NamePath, omitNil?: boolean) => FormData
  validateFieldsReturnFormatValue?: (nameList?: NamePath[], omitNil?: boolean) => Promise<FormData>
  setFieldsValue?: (values: FormData) => void
}

export interface ValueRef<T> {
  value?: T
}

export interface SubmitterContext<T = ProFormData> {
  form?: ProFormInstance<T> | FormInstance
  submit: () => void
  reset: () => void
}

export interface SearchConfig {
  resetText?: VNodeChild
  submitText?: VNodeChild
}

export type ActionButtonProps = ButtonProps & { preventDefault?: boolean }

export interface SubmitterProps<T = ProFormData> {
  onSubmit?: (value?: T) => void
  onReset?: (value?: T) => void
  searchConfig?: {
    submitText?: VNodeChild
    resetText?: VNodeChild
  }
  submitButtonProps?: false | ActionButtonProps
  resetButtonProps?: false | ActionButtonProps
  /** 完全自定义按钮区域；返回 false 表示隐藏 */
  render?: false | ((props: SubmitterContext<T>, dom: VNodeChild[]) => VNodeChild)
}

export type ProFormFinish<T = ProFormData> = {
  bivarianceHack: (formData: T) => Promise<boolean | void> | boolean | void
}['bivarianceHack']

export interface CommonFormProps<T = ProFormData, U = ProFormData> extends ProFormGridConfig {
  submitter?: false | SubmitterProps<T>
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
  onFinish?: ProFormFinish<T>
  onReset?: (formData: T) => void
  onLoadingChange?: (loading: boolean) => void
  onInit?: (values: T, form: ProFormInstance<T>) => void
}

export interface BaseFormProps<T = ProFormData, U = ProFormData>
  extends Omit<FormProps, 'model' | 'onFinish' | 'onReset'>, CommonFormProps<T, U> {
  /** 自定义内容渲染（items + submitter），用于 layouts/QueryFilter 等扩展 */
  contentRender?: (items: VNodeChild, submitter: VNodeChild | undefined, form: ProFormInstance<T> | undefined) => VNodeChild
  fieldProps?: FieldProps<unknown>
  proFieldProps?: ProFieldPropsType
  formItemProps?: FormItemProps
  groupProps?: ProFormGroupProps
  formComponentType?: ProFormLayoutType | (string & {})
  component?: false | string
  model?: T
}

export interface ProFormProps<T = ProFormData, U = ProFormData> extends BaseFormProps<T, U> {}

export interface ProFormGroupProps extends ProFormGridConfig {
  title?: VNodeChild
  collapsible?: boolean
  defaultCollapsed?: boolean
  labelLayout?: 'inline' | 'twoLine'
  extra?: VNodeChild
  style?: CSSProperties
}

export interface WarpFormItemProps {
  addonBefore?: VNodeChild
  addonAfter?: VNodeChild
  addonWarpStyle?: CSSProperties
  convertValue?: SearchConvertKeyFn
  help?: FormItemProps['help'] | ((params: { errors: VNodeChild[], warnings: VNodeChild[] }) => VNodeChild)
}

export interface ProFormItemProps
  extends Omit<FormItemProps, 'name' | 'help' | 'label' | 'tooltip' | 'rules' | 'required'>, WarpFormItemProps {
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
  transform?: SearchTransformKeyFn
  /** 取值时转换 */
  convertValue?: SearchConvertKeyFn
  /** 透传到 antdv FormItem */
  formItemProps?: FormItemProps
  fieldProps?: Record<string, any>
  colProps?: ColProps
  /** 是否跳过外层 FormItem，仅渲染受控控件 */
  ignoreFormItem?: boolean
}

export interface ProFormItemCreateConfig extends ProFormItemProps {
  valueType?: ProFieldValueTypeInput
  customLightMode?: boolean
  defaultProps?: Record<string, any>
  ignoreWidth?: boolean
}

export interface FieldProps<K = unknown> {
  style?: CSSProperties
  width?: string
  ref?: ShallowRef<K | undefined> | ((value: K | undefined) => void)
  onChange?: (...args: any[]) => void
  onBlur?: (...args: any[]) => void
  id?: string
  disabled?: boolean
  allowClear?: boolean
  placeholder?: string | string[]
  [key: string]: any
}

export type LightFilterFooterRender
  = | ((onConfirm?: (e?: MouseEvent) => void, onClear?: (e?: MouseEvent) => void) => VNodeChild | false)
    | false

export interface ExtendsProps<T = ProFormData> {
  secondary?: boolean
  allowClear?: boolean
  bordered?: boolean
  colSize?: number
  params?: ((form: ProFormInstance<T>) => ProFormData) | ProFormData
  ignoreFormItem?: boolean
  readonly?: boolean
  convertValue?: SearchConvertKeyFn
  formItemProps?: FormItemProps
  fieldConfig?: ProFormItemCreateConfig
  fieldRef?: ShallowRef<any> | ((value: any) => void)
}

export type ProFormFieldPropsFieldProps<T = ProFormData, K = unknown>
  = Partial<FieldProps<K>> & Partial<Record<keyof T, any>> & Record<string, any>

export interface ProFormFieldItemProps<T = ProFormData, K = unknown>
  extends Omit<ProFormItemProps, 'valueType'>, Pick<ProFormGridConfig, 'colProps'>, ExtendsProps<T> {
  fieldProps?: ProFormFieldPropsFieldProps<T, K>
  placeholder?: string | string[]
  secondary?: boolean
  emptyText?: VNodeChild
  cacheForSwr?: boolean
  disabled?: boolean
  width?: ProFormFieldWidth
  proFieldProps?: ProFieldPropsType
  readonly?: boolean
  valueType?: ProFieldValueTypeInput
  valueEnum?: ProFieldPropsType['valueEnum'] | Record<string, any> | Map<any, any>
  request?: (...args: any[]) => Promise<any[]>
  params?: Record<string, any>
  allowClear?: boolean
  children?: VNodeChild
  fieldConfig?: ProFormItemCreateConfig
  footerRender?: LightFilterFooterRender
  formItemRender?: ProRenderFieldPropsType['formItemRender']
  render?: ProRenderFieldPropsType['render']
}

export interface ProFormFieldProps<T = ProFormData, K = unknown> extends ProFormFieldItemProps<T, K>, ProRenderFieldPropsType {
  mode?: 'edit' | 'read' | 'update' | (string & {})
  isDefaultDom?: boolean
  text?: any
  value?: any
  getFieldProps?: () => Record<string, any>
  getFormItemProps?: () => Record<string, any>
  dependenciesValues?: Record<string, any>
  originDependencies?: Record<string, any>
}

export interface ProFormFieldSetProps<T = any> extends ProFormItemProps {
  value?: T[]
  onChange?: (value: T[]) => void
  fieldProps?: FieldProps
  space?: SpaceProps
  type?: 'space' | 'group'
  children?: ((value: T[], props: ProFormFieldSetProps<T>) => VNodeChild) | VNodeChild
}

export type ProFormDependencyRender<Values = any> = (
  values: Record<string, any>,
  form: ProFormInstance<Values>,
) => VNodeChild

export interface ProFormDependencyProps<T = ProFormData> extends Omit<FormItemProps, 'name' | 'noStyle' | 'children' | 'label'> {
  name: NamePath[]
  originDependencies?: NamePath[]
  ignoreFormListField?: boolean
  children?: ProFormDependencyRender<T>
}

export interface ProFormUploadButtonProps<T = ProFormData> extends ProFormFieldItemProps<T> {
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

export interface ProFormUploadDraggerProps<T = ProFormData> extends ProFormFieldItemProps<T> {
  icon?: VNodeChild
  title?: VNodeChild
  description?: VNodeChild
  max?: number
  value?: any[]
  action?: string | ((file: any) => Promise<string>)
  accept?: string
}

export const baseFormPropNames = [
  'model',
  'initialValues',
  'layout',
  'name',
  'labelCol',
  'wrapperCol',
  'grid',
  'rowProps',
  'colProps',
  'submitter',
  'loading',
  'readonly',
  'fieldProps',
  'formItemProps',
  'proFieldProps',
  'request',
  'params',
  'syncToUrl',
  'syncToUrlAsImportant',
  'extraUrlParams',
  'syncToInitialValues',
  'omitNil',
  'dateFormatter',
  'isKeyPressSubmit',
  'autoFocusFirstInput',
  'formKey',
  'formComponentType',
  'contentRender',
  'onFinish',
  'onReset',
  'onLoadingChange',
  'onInit',
] as const satisfies readonly (keyof BaseFormProps)[]

export const submitterPropNames = [
  'searchConfig',
  'submitButtonProps',
  'resetButtonProps',
  'onSubmit',
  'onReset',
  'render',
  'context',
] as const

export const proFormItemPropNames = [
  'name',
  'label',
  'tooltip',
  'rules',
  'required',
  'valuePropName',
  'initialValue',
  'valueType',
  'dataFormat',
  'extra',
  'help',
  'formItemProps',
  'fieldProps',
  'colProps',
  'convertValue',
  'transform',
  'ignoreFormItem',
] as const satisfies readonly (keyof ProFormItemProps)[]

export const proFormFieldPropNames = [
  ...proFormItemPropNames,
  'fieldProps',
  'value',
  'valueType',
  'valueEnum',
  'request',
  'params',
  'placeholder',
  'width',
  'readonly',
  'disabled',
  'allowClear',
  'proFieldProps',
  'formItemRender',
  'fieldConfig',
] as const satisfies readonly (keyof ProFormFieldProps)[]

export const proFormFieldSetPropNames = [
  ...proFormItemPropNames,
  'fieldProps',
  'value',
  'space',
  'type',
  'onChange',
] as const satisfies readonly (keyof ProFormFieldSetProps)[]

export const proFormDependencyPropNames = [
  'name',
  'originDependencies',
  'ignoreFormListField',
] as const satisfies readonly (keyof ProFormDependencyProps)[]
