import type { VNodeChild } from 'vue'

export interface FormListActionType<T = Record<string, any>> {
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
  Icon?: any
  tooltipText?: string
}

export interface ProFormListCommonProps {
  creatorButtonProps?: false | (Record<string, any> & {
    creatorButtonText?: VNodeChild
    position?: 'top' | 'bottom'
  })
  copyIconProps?: IconConfig | false
  deleteIconProps?: IconConfig | false
  upIconProps?: IconConfig | false
  downIconProps?: IconConfig | false
  arrowSort?: boolean
  creatorRecord?: Record<string, any> | (() => Record<string, any>)
  actionRender?: (field: any, action: FormListActionType, defaultActionDom: VNodeChild[], count: number) => VNodeChild[]
  itemContainerRender?: (doms: VNodeChild, listMeta: Record<string, any>) => VNodeChild
  itemRender?: (dom: { listDom: VNodeChild, action: VNodeChild }, listMeta: Record<string, any>) => VNodeChild
  fieldExtraRender?: (fieldAction: FormListActionType, meta: { errors?: VNodeChild[], warnings?: VNodeChild[] }) => VNodeChild
  alwaysShowItemLabel?: boolean
  max?: number
  min?: number
  containerClassName?: string
  containerStyle?: Record<string, any>
}
