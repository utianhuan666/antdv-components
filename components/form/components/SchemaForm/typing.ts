import type { VNodeChild } from 'vue'
import type { ProFieldValueTypeInput } from '../../../field'
import type { BaseFormProps, NamePath, ProFormLayoutType } from '../../typing'

export type SchemaValueType
  = | ProFieldValueTypeInput
    | 'group'
    | 'dependency'
    | 'formList'
    | 'formSet'
    | 'divider'
    | 'index'
    | 'indexBorder'
    | 'option'

export interface ExtraProColumnType {
  tooltip?: VNodeChild
  key?: string | number
  className?: string
  width?: number | string
  name?: NamePath | NamePath[]
  defaultKeyWords?: string
  rowProps?: Record<string, any>
  colProps?: Record<string, any>
}

export interface ProFormColumnsType<T = Record<string, any>, ValueType = 'text'> extends ExtraProColumnType {
  title?: VNodeChild | ((schema?: ProFormColumnsType<T, ValueType>, type?: string, dom?: VNodeChild) => VNodeChild)
  dataIndex?: NamePath
  valueType?: ValueType | SchemaValueType | ((entity?: T) => ValueType | SchemaValueType)
  index?: number
  colSize?: number
  readonly?: boolean
  initialValue?: any
  valueEnum?: Record<string, any> | Map<any, any> | ((entity?: T) => Record<string, any> | Map<any, any>)
  fieldProps?: Record<string, any> | ((form: any, config: ProFormColumnsType<T, ValueType>) => Record<string, any>)
  formItemProps?: Record<string, any> | ((form: any, config: ProFormColumnsType<T, ValueType>) => Record<string, any>)
  proFieldProps?: Record<string, any>
  renderText?: (text: any, record: T, index: number, action: any) => any
  render?: (dom: VNodeChild, entity: T, index: number, action: any, schema: ProFormColumnsType<T, ValueType>) => VNodeChild
  formItemRender?: (
    schema: ProFormColumnsType<T, ValueType>,
    config: Record<string, any> & { defaultRender?: (schema?: ProFormColumnsType<T, ValueType>) => VNodeChild },
    form: any,
  ) => VNodeChild | false
  request?: (params?: Record<string, any>, props?: Record<string, any>) => Promise<{ label?: VNodeChild, text?: VNodeChild, value: any }[]>
  params?: Record<string, any>
  dependencies?: NamePath[] | NamePath
  hideInDescriptions?: boolean
  hideInForm?: boolean
  hideInTable?: boolean
  hideInSearch?: boolean
  columns?: ProFormColumnsType<T, any>[] | ((values: Record<string, any>) => ProFormColumnsType<T, any>[])
  convertValue?: (value: any, namePath: NamePath) => any
  transform?: (value: any, namePath: NamePath, allValues?: Record<string, any>) => any
  order?: number
  debounceTime?: number
  ignoreFormItem?: boolean
}

export type SchemaLayoutType = ProFormLayoutType | 'StepForm' | 'Embed'

export interface BetaSchemaFormProps<T = Record<string, any>, U = Record<string, any>, ValueType = 'text'> extends BaseFormProps<T, U> {
  layoutType?: SchemaLayoutType
  type?: string
  steps?: Record<string, any>[]
  columns?: ProFormColumnsType<T, ValueType>[] | ProFormColumnsType<T, ValueType>[][]
  shouldUpdate?: boolean | ((newValues: Record<string, any>, oldValues?: Record<string, any>) => boolean)
  title?: VNodeChild
  action?: { value?: any }
  formRef?: { value?: any }
  open?: boolean
  trigger?: VNodeChild
  modalProps?: Record<string, any>
  drawerProps?: Record<string, any>
  onCurrentChange?: (current: number) => void
}

export interface ItemType<T = Record<string, any>, ValueType = 'text'> extends ProFormColumnsType<T, ValueType> {
  label?: VNodeChild
  getFieldProps?: () => Record<string, any>
  getFormItemProps?: () => Record<string, any>
  originProps?: ProFormColumnsType<T, ValueType>
}

export interface ProFormRenderValueTypeHelpers<T = Record<string, any>, ValueType = 'text'> {
  action?: { value?: any }
  type?: string
  originItem: ProFormColumnsType<T, ValueType>
  formRef: { value?: any }
  genItems: (items: ProFormColumnsType<T, any>[]) => VNodeChild[]
}

export type ProSchemaRenderValueTypeFunction<T = Record<string, any>, ValueType = 'text'> = (
  item: ItemType<T, ValueType>,
  helpers: ProFormRenderValueTypeHelpers<T, ValueType>,
) => VNodeChild | true | null | false | undefined
