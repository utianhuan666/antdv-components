import type { CSSProperties, VNodeChild } from 'vue'
import type { LabelTooltipType } from '../utils'

export type { LabelTooltipType }

export type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
export type Gutter = number | Partial<Record<Breakpoint, number>>
export type ColSpanType = number | string
export type CollapsibleType = 'icon' | 'header' | boolean
export type VueNode = VNodeChild

export interface ProCardStyles {
  root?: CSSProperties
  header?: CSSProperties
  body?: CSSProperties
  extra?: CSSProperties
  title?: CSSProperties
  actions?: CSSProperties
  cover?: CSSProperties
}

export interface ProCardClassNames {
  root?: string
  header?: string
  body?: string
  extra?: string
  title?: string
  actions?: string
  cover?: string
}

export interface CardPropsBase {
  rootClassName?: string
  cover?: VueNode
  styles?: ProCardStyles
  classNames?: ProCardClassNames
  headerBordered?: boolean
  title?: VueNode
  subTitle?: VueNode
  tooltip?: string | LabelTooltipType
  extra?: VueNode
  layout?: 'default' | 'center'
  type?: 'default' | 'inner'
  direction?: 'column' | 'row'
  wrap?: boolean
  size?: 'default' | 'small'
  loading?: boolean | VueNode
  colSpan?: ColSpanType | Partial<Record<Breakpoint, ColSpanType>>
  colStyle?: CSSProperties
  gutter?: Gutter | Gutter[]
  actions?: VueNode[] | VueNode
  split?: 'vertical' | 'horizontal'
  variant?: 'outlined' | 'borderless'
  hoverable?: boolean
  ghost?: boolean
  collapsible?: CollapsibleType
  collapsed?: boolean
  collapsibleIconRender?: (args: { collapsed: boolean }) => VueNode
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  prefixCls?: string
  checked?: boolean
  onChecked?: (event: MouseEvent) => void
  boxShadow?: boolean
  class?: any
  className?: any
  style?: CSSProperties
  onClick?: (event: MouseEvent) => void
}

export interface ProCardTabItem {
  key: string
  label?: VueNode
  children?: VueNode
  content?: VueNode
  disabled?: boolean
  [key: string]: any
}

export interface ProCardTabsProps {
  cardProps?: CardPropsBase
  items?: ProCardTabItem[]
  onChange?: (key: string) => void
  [key: string]: any
}

export type CardProps = CardPropsBase & {
  tabs?: ProCardTabsProps
}

export interface ProCardTabPaneProps {
  key?: string
  cardProps?: CardProps
  [key: string]: any
}
