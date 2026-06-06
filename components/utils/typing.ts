import type { AvatarProps, CascaderProps, CheckboxProps, ColorPickerProps, DatePickerProps, DividerProps, FormInstance, FormItemProps, ImageProps, InputNumberProps, InputPasswordProps, InputProps, PopoverProps, ProgressProps, RadioProps, RangePickerProps, RateProps, SegmentedProps, SelectProps, SliderProps, SpaceProps, SwitchProps, TextAreaProps, TimeRangePickerProps, TreeSelectProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type {
  ProFieldBuiltinValueType,
  ProFieldSchemaLayoutValueType,
  ProFieldTextType,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProSchemaValueEnumMap,
  ProSchemaValueEnumObj,
  ProSchemaValueEnumType,
} from '../field/types'
import type { UseEditableUtilType } from './useEditableArray'
import { PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES } from '../field/types'

export type {
  ProFieldBuiltinValueType,
  ProFieldSchemaLayoutValueType,
  ProFieldTextType,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProSchemaValueEnumMap,
  ProSchemaValueEnumObj,
  ProSchemaValueEnumType,
}

export { PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES }

export type LabelTooltipType = any
export type WrapperTooltipProps = any
export type NamePath = string | number | (string | number)[]
export type ProFieldValueEnumType = ProSchemaValueEnumMap | ProSchemaValueEnumObj

export interface ProFormBaseGroupProps {
  title?: VNodeChild
  label?: VNodeChild
  tooltip?: LabelTooltipType | string
  extra?: VNodeChild
  size?: SpaceProps['size']
  style?: CSSProperties
  titleStyle?: CSSProperties
  titleRender?: (title: VNodeChild, props: ProFormBaseGroupProps) => VNodeChild
  align?: SpaceProps['align']
  spaceProps?: SpaceProps
  direction?: SpaceProps['orientation']
  labelLayout?: 'inline' | 'twoLine'
  collapsed?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  autoFocus?: boolean
  children?: VNodeChild
}

export interface ProFieldValueTypeWithFieldProps {
  text: InputProps
  password: InputPasswordProps
  money: Record<string, any>
  index: Record<string, any>
  indexBorder: Record<string, any>
  option: Record<string, any>
  textarea: TextAreaProps
  date: DatePickerProps
  dateWeek: DatePickerProps
  dateMonth: DatePickerProps
  dateQuarter: DatePickerProps
  dateYear: DatePickerProps
  dateTime: DatePickerProps
  fromNow: DatePickerProps
  dateRange: RangePickerProps
  dateTimeRange: RangePickerProps
  dateWeekRange: RangePickerProps
  dateMonthRange: RangePickerProps
  dateQuarterRange: RangePickerProps
  dateYearRange: RangePickerProps
  time: TimeRangePickerProps
  timeRange: TimeRangePickerProps
  select: SelectProps
  checkbox: CheckboxProps
  rate: RateProps
  slider: SliderProps
  radio: RadioProps
  radioButton: RadioProps
  progress: ProgressProps
  percent: InputNumberProps
  digit: InputNumberProps
  digitRange: InputNumberProps
  second: InputNumberProps
  code: InputProps | TextAreaProps
  jsonCode: InputProps | TextAreaProps
  avatar: AvatarProps
  switch: SwitchProps
  image: ImageProps | InputProps
  cascader: CascaderProps
  treeSelect: TreeSelectProps
  color: ColorPickerProps & {
    value?: string
    popoverProps?: PopoverProps
    mode?: 'read' | 'edit'
    onChange?: (color: string) => void
    colors?: string[]
    old?: boolean
  }
  segmented: SegmentedProps
  group: ProFormBaseGroupProps
  formList: Record<string, any>
  formSet: Record<string, any>
  divider: DividerProps
  dependency: FormItemProps
}

type FieldPropsTypeBase<
  Entity = Record<string, any>,
  ComponentsType = 'text',
  ExtraProps = Record<string, any>,
  FieldPropsType = ProFieldValueTypeWithFieldProps['text'],
>
  = | ((
    form: FormInstance,
    config: ProSchema<Entity, ExtraProps> & {
      type: ComponentsType
      isEditable?: boolean
      rowKey?: string
      rowIndex: number
      entity: Entity
    },
  ) => FieldPropsType | Record<string, any>)
  | FieldPropsType
  | Record<string, any>

export type ProFieldValueObject<Type> = Type extends 'progress' | 'money' | 'percent' | 'image'
  ? {
      type: Type
      status?: 'normal' | 'active' | 'success' | 'exception' | undefined
      locale?: string
      showSymbol?: ((value: any) => boolean) | boolean
      showColor?: boolean
      precision?: number
      moneySymbol?: boolean
      request?: ProFieldRequestData
      width?: number
    }
  : never

interface ValueTypeWithFieldPropsBase<
  Entity = Record<string, any>,
  ComponentsType = 'form',
  ExtraProps = Record<string, any>,
  ValueType = 'text',
> {
  valueType?:
    | ValueType
    | ProFieldValueType
    | ProFieldValueObject<ValueType | ProFieldValueType>
    | ((
      entity: Entity,
      type: ComponentsType,
    ) => ValueType | ProFieldValueType | ProFieldValueObject<ValueType | ProFieldValueType>)
  fieldProps?: FieldPropsTypeBase<
    Entity,
    ComponentsType,
    ExtraProps,
    ValueType extends ProFieldValueType
      ? ProFieldValueTypeWithFieldProps[ValueType]
      : ProFieldValueTypeWithFieldProps['text']
  >
}

export type ValueTypeWithFieldProps<
  Entity,
  ComponentsType,
  ExtraProps,
  ValueType = 'text',
> = ValueTypeWithFieldPropsBase<Entity, ComponentsType, ExtraProps, ValueType>

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

export type ProFieldRequestData<U = any> = (
  params: U,
  props: any,
) => Promise<RequestOptionsType[]>

export type SearchTransformKeyFn = (
  value: any,
  namePath: string[],
  allValues: any,
) => any

export type SearchConvertKeyFn = (
  value: any,
  field: NamePath,
) => string | boolean | Record<string, any>

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
  formItemProps?: (FormItemProps & ExtraFormItemProps) | ((
    form: FormInstance,
    config: ProSchema<Entity, ExtraProps, ComponentsType, ValueType, ExtraFormItemProps> & {
      type?: ComponentsType
      isEditable?: boolean
      rowKey?: string
      rowIndex?: number
      entity?: Entity
    },
  ) => FormItemProps & ExtraFormItemProps)
  renderText?: (text: any, record: Entity, index: number, action: ProCoreActionType) => any
  render?: (
    dom: VNodeChild,
    entity: Entity,
    index: number,
    action: ProCoreActionType | undefined,
    schema: ProSchema<Entity, ExtraProps, ComponentsType, ValueType, ExtraFormItemProps> & {
      isEditable?: boolean
      type: ComponentsType
    },
  ) => VNodeChild | { children: VNodeChild, props: any }
  formItemRender?: (
    schema: ProSchema<Entity, ExtraProps, ComponentsType, ValueType, ExtraFormItemProps> & {
      isEditable?: boolean
      index?: number
      type: ComponentsType
      originProps?: any
    },
    config: {
      onSelect?: (value: any) => void
      onChange?: <T = any>(value: T) => void
      value?: any
      type: ComponentsType
      recordKey?: string | number | (string | number)[]
      record?: Entity
      isEditable?: boolean
      defaultRender: (
        newItem: ProSchema<Entity, ExtraProps, ComponentsType, ValueType>,
      ) => VNodeChild | null
    },
    form: FormInstance,
    action?: Omit<UseEditableUtilType, 'newLineRecord' | 'editableKeys' | 'actionRender' | 'setEditableRowKeys'>,
  ) => VNodeChild
  editable?: false | ProTableEditableFnType<Entity>
  request?: ProFieldRequestData
  debounceTime?: number
  params?: ((record: Entity, column: ProSchema<Entity, ExtraProps>) => Record<string, any>) | Record<string, any>
  dependencies?: NamePath[]
  ignoreFormItem?: boolean
  hideInDescriptions?: boolean
  hideInForm?: boolean
  hideInTable?: boolean
  proFieldProps?: ProFieldProps & Record<string, any>
} & ExtraProps & ValueTypeWithFieldProps<Entity, ComponentsType, ExtraProps, ValueType>

export type ProSchemaFieldProps<T>
  = | Record<string, any>
    | T
    | Partial<InputProps>

export interface ProFieldProps {
  light?: boolean
  emptyText?: VNodeChild
  label?: VNodeChild
  mode?: 'read' | 'edit'
  proFieldKey?: string
  render?: any
  readonly?: boolean
}
