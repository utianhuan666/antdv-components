import type { TabsProps } from 'antdv-next'
import type { CSSProperties, DefineComponent, HTMLAttributes, VNodeChild } from 'vue'
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

export interface ProCardTabsProps extends Omit<TabsProps, 'items' | 'onChange'> {
  cardProps?: CardPropsBase
  items?: ProCardTabItem[]
  onChange?: (key: string) => void
}

export type CardProps = CardPropsBase & Omit<HTMLAttributes, 'title' | 'prefix' | 'onClick'> & {
  tabs?: ProCardTabsProps
}

export interface ProCardTabPaneProps {
  key?: string
  cardProps?: CardProps
  [key: string]: any
}

export type CardType = DefineComponent<CardProps> & {
  isProCard?: boolean
}

export interface ProCardSlots {
  default?: () => any
  title?: () => any
  extra?: () => any
  cover?: () => any
  actions?: () => any
}

export interface StatisticCardSlots extends ProCardSlots {
  chart?: () => any
  footer?: () => any
}

export interface StatisticSlots {
  title?: () => any
  prefix?: () => any
  suffix?: () => any
  tip?: () => any
  icon?: () => any
  description?: () => any
  formatter?: (args: { value?: string | number }) => any
}
