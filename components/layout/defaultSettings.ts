import type { MenuDataItem } from './typing'

export type ContentWidth = 'Fluid' | 'Fixed'

export interface RenderSetting {
  headerRender?: false
  footerRender?: false
  menuRender?: false
  menuHeaderRender?: false
}

export interface PureSettings {
  layout?: 'side' | 'top' | 'mix'
  contentWidth?: ContentWidth
  fixedHeader?: boolean
  fixSiderbar?: boolean
  menu?: {
    locale?: boolean
    hideMenuWhenCollapsed?: boolean
    collapsedShowTitle?: boolean
    collapsedShowGroupTitle?: boolean
    defaultOpenAll?: boolean
    ignoreFlatMenu?: boolean
    loading?: boolean
    onLoadingChange?: (loading?: boolean) => void
    params?: Record<string, any>
    request?: (
      params: Record<string, any>,
      defaultMenuData: MenuDataItem[],
    ) => Promise<MenuDataItem[]>
    type?: 'sub' | 'group'
    autoClose?: false
    collapsedWidth?: number
  }
  title?: string | false
  colorPrimary?: string
  colorWeak?: boolean
  splitMenus?: boolean
  suppressSiderWhenMenuEmpty?: boolean
  siderMenuType?: 'sub' | 'group'
}

export type ProSettings = PureSettings & RenderSetting

const defaultSettings: ProSettings = {
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorPrimary: '#1677FF',
  splitMenus: false,
  menu: {
    collapsedWidth: 64,
  },
}

export { defaultSettings }
