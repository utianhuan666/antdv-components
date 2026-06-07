import type { CSSProperties, VNodeChild } from 'vue'
import type { MenuDataItem } from '../../typing'
import type { AppItemProps, AppListProps } from '../AppsLogoComponents/types'

export type { MenuDataItem } from '../../typing'

export type WithFalse<T> = T | false
export type MenuMode = 'vertical' | 'horizontal'

export type { AppItemProps, AppListProps }

export interface ProLayoutNavMenuSelectInfo {
  key: string
  selectedKeys: string[]
}

export type ProLayoutNavMenuDomProps = Record<string, any>

export interface NavMenuLeafNode {
  kind: 'item'
  key: string
  disabled?: boolean
  label: VNodeChild
  raw: MenuDataItem
  onClick?: () => void
  className?: string
}

export interface NavMenuSubmenuNode {
  kind: 'submenu'
  key: string
  label: VNodeChild
  raw: MenuDataItem
  children: NavMenuNode[]
  className?: string
  hasIcon?: boolean
  onTitleClick?: () => void
}

export interface NavMenuGroupNode {
  kind: 'group'
  key: string
  label: VNodeChild
  children: NavMenuNode[]
  className?: string
}

export interface NavMenuDividerNode {
  kind: 'divider'
  key: string
}

export type NavMenuNode
  = | NavMenuLeafNode
    | NavMenuSubmenuNode
    | NavMenuGroupNode
    | NavMenuDividerNode

export interface BaseMenuProps {
  prefixCls?: string
  selectedKeys?: string[]
  onSelect?: (info: ProLayoutNavMenuSelectInfo) => void
  className?: string
  collapsed?: boolean
  splitMenus?: boolean
  isMobile?: boolean
  menuData?: MenuDataItem[]
  mode?: MenuMode
  onCollapse?: (collapsed: boolean) => void
  openKeys?: WithFalse<string[]> | undefined
  onOpenChange?: (openKeys: string[]) => void
  menuProps?: ProLayoutNavMenuDomProps
  style?: CSSProperties
  formatMessage?: (message: { id: any, defaultMessage?: string }) => string
  location?: { pathname?: string }
  layout?: 'side' | 'top' | 'mix'
  menu?: {
    locale?: boolean
    loading?: boolean
    type?: 'group' | 'sub'
    autoClose?: boolean
    defaultOpenAll?: boolean
    collapsedWidth?: number
    hideMenuWhenCollapsed?: boolean
  }
  postMenuData?: (menusData?: MenuDataItem[]) => MenuDataItem[]
  matchMenuKeys?: string[]
  menuRenderType?: 'header' | 'sider'
  menuTextRender?: WithFalse<(item: MenuDataItem, defaultText: VNodeChild, menuConfig: BaseMenuProps) => VNodeChild>
  menuItemRender?: WithFalse<(
    item: MenuDataItem & { isUrl: boolean, onClick: () => void, itemPath: string, replace?: boolean },
    defaultDom: VNodeChild,
    menuConfig: BaseMenuProps,
  ) => VNodeChild>
  subMenuItemRender?: WithFalse<(
    item: MenuDataItem & { isUrl: boolean },
    defaultDom: VNodeChild,
    menuConfig: BaseMenuProps,
  ) => VNodeChild>
}

export type SiderMenuProps = BaseMenuProps & {
  theme?: 'light' | 'dark'
  logo?: VNodeChild | (() => VNodeChild)
  appList?: AppListProps
  appListRender?: (props: AppListProps, defaultDom: VNodeChild) => VNodeChild
  itemClick?: (item: AppItemProps, popoverRef?: any) => void
  siderWidth?: number
  avatarProps?: false | (Record<string, any> & {
    title?: VNodeChild
    render?: (avatarProps: Record<string, any>, defaultDom: VNodeChild, props: SiderMenuProps) => VNodeChild
  })
  actionsRender?: WithFalse<(props: HeaderViewProps) => VNodeChild[] | VNodeChild>
  actionsPlacement?: 'header' | 'sider'
  menuHeaderRender?: WithFalse<(logo: VNodeChild, title: VNodeChild, props?: SiderMenuProps) => VNodeChild>
  headerTitleRender?: WithFalse<(logo: VNodeChild, title: VNodeChild, props?: SiderMenuProps) => VNodeChild>
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => VNodeChild>
  menuContentRender?: WithFalse<(props: SiderMenuProps, defaultDom: VNodeChild) => VNodeChild>
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => VNodeChild>
  collapsedButtonRender?: WithFalse<(collapsed?: boolean, defaultDom?: VNodeChild) => VNodeChild>
  breakpoint?: string | false
  onMenuHeaderClick?: (e: MouseEvent) => void
  links?: VNodeChild[]
  getContainer?: false
  logoStyle?: CSSProperties
  hide?: boolean
  fixSiderbar?: boolean
  originCollapsed?: boolean
  matchMenuKeys?: string[]
  menuRenderType?: 'header' | 'sider'
  stylish?: any
  title?: VNodeChild
}

export type HeaderViewProps = SiderMenuProps & {
  isMobile?: boolean
  fixedHeader?: boolean
  headerRender?: WithFalse<(props: HeaderViewProps, defaultDom: VNodeChild) => VNodeChild>
  headerContentRender?: WithFalse<(props: HeaderViewProps, defaultDom: VNodeChild) => VNodeChild>
  headerMenuRender?: WithFalse<(props: HeaderViewProps, defaultMenu: VNodeChild) => VNodeChild>
  contentWidth?: 'Fluid' | 'Fixed'
  hasSiderMenu?: boolean
}

export type ProLayoutNavMenuProps = BaseMenuProps
