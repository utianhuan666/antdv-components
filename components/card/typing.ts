import type { TabPaneProps, TabsProps } from 'antdv-next'
import type { CSSProperties, DefineComponent, HTMLAttributes, VNodeChild } from 'vue'
import type { LabelTooltipType } from '../utils'

// 重新导出以保持向后兼容
export type { LabelTooltipType }

export type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
export type Gutter = number | Partial<Record<Breakpoint, number>>
export type ColSpanType = number | string
type CollapsibleType = 'icon' | 'header' | boolean

/** 与 antd Card 一致的 styles 结构 */
export interface ProCardStyles {
  root?: CSSProperties
  header?: CSSProperties
  body?: CSSProperties
  extra?: CSSProperties
  title?: CSSProperties
  actions?: CSSProperties
  cover?: CSSProperties
}

/** 与 antd Card 一致的 classNames 结构 */
export interface ProCardClassNames {
  root?: string
  header?: string
  body?: string
  extra?: string
  title?: string
  actions?: string
  cover?: string
}

// React 侧为 Pick<AntdCardProps, 'rootClassName' | 'cover'>；antdv-next 的 Card props 不含这两个键，
// 故按 antd 的语义内联（rootClassName: string、cover: ReactNode → VNodeChild）。
interface CardPropsBase {
  /** 根元素 className */
  rootClassName?: string
  /** 卡片封面 */
  cover?: VNodeChild
  /** 样式配置，与 antd Card styles 结构一致 */
  styles?: ProCardStyles
  /** 语义化 classNames，与 antd Card classNames 结构一致 */
  classNames?: ProCardClassNames
  /** 页头是否有分割线 */
  headerBordered?: boolean
  /** 卡片标题 */
  title?: VNodeChild
  /** 副标题 */
  subTitle?: VNodeChild
  /** 标题说明 */
  tooltip?: string | LabelTooltipType
  /** 右上角自定义区域 */
  extra?: VNodeChild
  /** 布局，center 代表垂直居中 */
  layout?: 'default' | 'center'
  /** 卡片类型 */
  type?: 'default' | 'inner'
  /** 指定 Flex 方向，仅在嵌套子卡片时有效 */
  direction?: 'column' | 'row'
  /** 是否自动换行，仅在嵌套子卡片时有效 */
  wrap?: boolean
  /** 尺寸 */
  size?: 'default' | 'small'
  /** 加载中 */
  loading?: boolean | VNodeChild
  /** 栅格布局宽度，24 栅格，支持指定宽度或百分，需要支持响应式 colSpan={{ xs: 12, sm: 6 }} */
  colSpan?: ColSpanType | Partial<Record<Breakpoint, ColSpanType>>
  colStyle?: CSSProperties
  /** 栅格间距 */
  gutter?: Gutter | Gutter[]
  /** 操作按钮 */
  actions?: VNodeChild[] | VNodeChild
  /** 拆分卡片方式 */
  split?: 'vertical' | 'horizontal'
  /** 卡片变体，与 antd Card variant 一致 */
  variant?: 'outlined' | 'borderless'
  /**
   * 鼠标移过时可浮起
   *
   * @default false
   */
  hoverable?: boolean
  /** 幽灵模式，即是否取消卡片内容区域的 padding 和 背景颜色。 */
  ghost?: boolean
  /** 是否可折叠 */
  collapsible?: CollapsibleType
  /** 受控 collapsed 属性 */
  collapsed?: boolean
  /** 折叠按钮自定义节点 */
  collapsibleIconRender?: ({
    collapsed,
  }: {
    collapsed: boolean
  }) => VNodeChild
  /** 配置默认是否折叠 */
  defaultCollapsed?: boolean
  /** 收起卡片的事件 */
  onCollapse?: (collapsed: boolean) => void
  /** 前缀 */
  prefixCls?: string
  /** 是否展示选中样式 */
  checked?: boolean
  /** 选中改变 */
  onChecked?: (e: MouseEvent) => void
  /** card的阴影 */
  boxShadow?: boolean
  // ===== Vue 框架补充：React 经 React.HTMLAttributes<HTMLDivElement> 提供以下 DOM 透传属性，=====
  // ===== Vue 的 HTMLAttributes 不含 className，且 onClick 需单独声明以避免与下方 Omit 冲突。 =====
  // ===== React 的 ref?: React.Ref<HTMLDivElement> 在 Vue 中由模板 ref / defineExpose 承担，故省略。 =====
  class?: any
  className?: any
  style?: CSSProperties
  onClick?: (event: MouseEvent) => void
}

export type ProCardTabsProps = {
  // 透传的card样式props
  cardProps?: CardPropsBase
  // Vue 框架补充：antdv-next Tabs 的 item 用 content 字段承载内容（React antd 用 children），
  // 故 items 用桥接类型 ProCardTabItem（同时支持 content 与 children）。
  items?: ProCardTabItem[]
  onChange?: (key: string) => void
} & Omit<TabsProps, 'items' | 'onChange'>

export type CardProps = {
  /** 标签栏配置 */
  tabs?: ProCardTabsProps
} & CardPropsBase
& Omit<HTMLAttributes, 'title' | 'prefix' | 'onClick'>

export type ProCardTabPaneProps = {
  /** Key */
  key?: string
  /** ProCard 相关属性透传 */
  cardProps?: CardProps
} & TabPaneProps

export type CardType = DefineComponent<CardProps>

// ====== 以下为 Vue 框架特有补充（React 无对应）：tab item 桥接类型 ======

/** tab item 桥接类型：同时支持 React 的 children 与 antdv-next 的 content */
export interface ProCardTabItem {
  key: string
  label?: VNodeChild
  children?: VNodeChild
  content?: VNodeChild
  disabled?: boolean
  [key: string]: any
}
