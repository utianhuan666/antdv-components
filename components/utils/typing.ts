import type { FormInstance, FormItemProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type {
  ProFieldRequestData,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProSchemaValueEnumMap,
  ProSchemaValueEnumObj,
  ProSchemaValueEnumType,
} from '../field/types'
import type { SearchConvertKeyFn, SearchTransformKeyFn } from '../form'
import type { UseEditableUtilType } from './useEditableArray'

export type {
  ProFieldRequestData,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProSchemaValueEnumMap,
  ProSchemaValueEnumObj,
  ProSchemaValueEnumType,
  SearchConvertKeyFn,
  SearchTransformKeyFn,
}

export type LabelTooltipType = any
export type WrapperTooltipProps = any
export type NamePath = string | number | (string | number)[]
export type ProFieldValueEnumType = ProSchemaValueEnumMap | ProSchemaValueEnumObj

export interface ProFormBaseGroupProps {
  title?: VNodeChild
  label?: VNodeChild
  tooltip?: LabelTooltipType | string
  extra?: VNodeChild
  size?: any
  style?: CSSProperties
  titleStyle?: CSSProperties
  titleRender?: (title: VNodeChild, props: ProFormBaseGroupProps) => VNodeChild
  align?: any
  spaceProps?: any
  direction?: any
  labelLayout?: 'inline' | 'twoLine'
  collapsed?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  autoFocus?: boolean
  children?: VNodeChild
}

export type ProFieldValueTypeWithFieldProps = Record<ProFieldValueType, Record<string, any>>

export interface PageInfo {
  pageSize: number
  total: number
  current: number
}

export interface RequestOptionsType {
  label?: VNodeChild
  value?: string | number | boolean
  optionType?: 'optGroup' | 'option'
  options?: Omit<RequestOptionsType, 'children' | 'optionType'>[]
  [key: string]: any
}

export type ProTableEditableFnType<T> = (value: any, record: T, index: number) => boolean
export type ProSchemaComponentTypes = 'form' | 'list' | 'descriptions' | 'table' | 'cardList' | undefined

export interface ProCoreActionBase {
  reload: (resetPageIndex?: boolean) => Promise<void>
  reloadAndRest?: () => Promise<void>
  reset?: () => void
  clearSelected?: () => void
  pageInfo?: PageInfo
}

export type ProCoreActionType<
  T = {},
  EditableUtil = Omit<UseEditableUtilType, 'newLineRecord' | 'editableKeys' | 'actionRender' | 'setEditableRowKeys'>,
> = ProCoreActionBase & EditableUtil & T

export type ProSchema<
  Entity = Record<string, any>,
  ExtraProps = unknown,
  ComponentsType extends ProSchemaComponentTypes = 'form',
  ValueType = 'text',
  ExtraFormItemProps = unknown,
> = {
  key?: string | number
  dataIndex?: unknown
  title?: ((schema: ProSchema<Entity, ExtraProps, ComponentsType, ValueType, ExtraFormItemProps>, type: ComponentsType, dom: VNodeChild) => VNodeChild) | VNodeChild
  tooltip?: LabelTooltipType | string
  valueEnum?: ((row: Entity) => ProSchemaValueEnumObj | ProSchemaValueEnumMap) | ProSchemaValueEnumObj | ProSchemaValueEnumMap
  formItemProps?: (FormItemProps & ExtraFormItemProps) | ((form: FormInstance, config: any) => FormItemProps & ExtraFormItemProps)
  renderText?: (text: any, record: Entity, index: number, action: ProCoreActionType) => any
  render?: (dom: VNodeChild, entity: Entity, index: number, action: ProCoreActionType | undefined, schema: any) => VNodeChild | { children: VNodeChild, props: any }
  formItemRender?: (schema: any, config: any, form: FormInstance, action?: any) => VNodeChild
  editable?: false | ProTableEditableFnType<Entity>
  request?: ProFieldRequestData
  debounceTime?: number
  params?: ((record: Entity, column: ProSchema<Entity, ExtraProps>) => Record<string, any>) | Record<string, any>
  dependencies?: NamePath[]
  ignoreFormItem?: boolean
  hideInDescriptions?: boolean
  hideInForm?: boolean
  hideInTable?: boolean
  proFieldProps?: Record<string, any>
  valueType?: ValueType | ProFieldValueType | ProFieldValueObjectType | ((entity: Entity, type: ComponentsType) => ValueType | ProFieldValueType | ProFieldValueObjectType)
  fieldProps?: Record<string, any> | ((form: FormInstance, config: any) => Record<string, any>)
} & ExtraProps

export interface ProFieldProps {
  light?: boolean
  emptyText?: VNodeChild
  label?: VNodeChild
  mode?: 'read' | 'edit'
  proFieldKey?: string
  render?: any
  readonly?: boolean
}
