import type { Component, VNodeChild } from 'vue'
import type { NamePath } from '../../typing'

export type FormListRecord = Record<string, any>

export interface FormListField<T = FormListRecord> {
  name: number
  key: number
  record: T
}

export interface FormListItemField {
  name: number
  key: number
}

export interface FormListActionType<T = FormListRecord> {
  add: (defaultValue?: Partial<T>, insertIndex?: number) => Promise<void>
  remove: (index: number) => Promise<void>
  move: (from: number, to: number) => void
  get: (index: number) => T | undefined
  getList: () => T[]
}

export interface FormListActionGuard {
  beforeAddRow?: (defaultValue: any, insertIndex: number, count: number) => boolean | Promise<boolean>
  beforeRemoveRow?: (index: number, count: number) => boolean | Promise<boolean>
}

export interface IconConfig {
  Icon?: Component
  tooltipText?: string
}

export interface FormListActionWithCurrentRow<T = FormListRecord> extends FormListActionType<T> {
  getCurrentRowData: () => T
  setCurrentRowData: (data: Partial<T>) => void
}

export interface ProFormListSlotProps<T = FormListRecord> {
  field: FormListItemField
  index: number
  action: FormListActionWithCurrentRow<T>
  count: number
}

export interface ProFormListCommonProps<T = FormListRecord> {
  creatorButtonProps?: false | (Record<string, any> & {
    creatorButtonText?: VNodeChild
    position?: 'top' | 'bottom'
  })
  copyIconProps?: IconConfig | false
  deleteIconProps?: IconConfig | false
  upIconProps?: IconConfig | false
  downIconProps?: IconConfig | false
  arrowSort?: boolean
  creatorRecord?: T | (() => T)
  actionRender?: (field: FormListItemField, action: FormListActionType<T>, defaultActionDom: VNodeChild[], count: number) => VNodeChild[]
  itemContainerRender?: (doms: VNodeChild, listMeta: Record<string, any>) => VNodeChild
  itemRender?: (dom: { listDom: VNodeChild, action: VNodeChild }, listMeta: Record<string, any>) => VNodeChild
  fieldExtraRender?: (fieldAction: FormListActionType<T>, meta: { errors?: VNodeChild[], warnings?: VNodeChild[] }) => VNodeChild
  alwaysShowItemLabel?: boolean
  max?: number
  min?: number
  containerClassName?: string
  containerStyle?: Record<string, any>
}

export interface ProFormListProps<T = FormListRecord> extends ProFormListCommonProps<T> {
  name: NamePath
  label?: VNodeChild
  tooltip?: VNodeChild
  initialValue?: T[]
  actionGuard?: FormListActionGuard
  actionRef?: { value?: FormListActionType<T> }
  creatorButtonText?: string
  rules?: any[]
  required?: boolean
  readonly?: boolean
  isValidateList?: boolean
  emptyListMessage?: string
  colProps?: Record<string, any>
  rowProps?: Record<string, any>
  onAfterAdd?: (defaultValue: Partial<T> | undefined, insertIndex: number, count: number) => void
  onAfterRemove?: (index: number, count: number) => void
  children?: VNodeChild | {
    default?: (props: ProFormListSlotProps<T>) => VNodeChild
  }
}

export interface ProFormListContainerProps<T = FormListRecord> extends ProFormListCommonProps<T> {
  name: NamePath
  originName: NamePath
  listName: (index: number) => (string | number)[]
  fields: FormListField<T>[]
  action: FormListActionType<T>
  readonly?: boolean
  creatorButtonText?: string
  actionGuard?: FormListActionGuard
}

export interface ProFormListItemProviderProps<T = FormListRecord> {
  model: T
  listName: (string | number)[]
  name: number
}

export interface ProFormListItemProps<T = FormListRecord> extends Pick<
  ProFormListCommonProps<T>,
  | 'copyIconProps'
  | 'deleteIconProps'
  | 'upIconProps'
  | 'downIconProps'
  | 'arrowSort'
  | 'actionRender'
  | 'itemRender'
  | 'itemContainerRender'
  | 'alwaysShowItemLabel'
  | 'min'
  | 'max'
  | 'containerClassName'
  | 'containerStyle'
> {
  field: FormListItemField
  index: number
  record: T
  fields: FormListItemField[]
  count: number
  name: NamePath
  originName: NamePath
  listName: (string | number)[]
  action: FormListActionType<T>
  readonly?: boolean
}
