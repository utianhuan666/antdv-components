import type { ProSettings } from '../../layout/defaultSettings'

export type ContentWidth = 'Fluid' | 'Fixed'

export interface RenderSetting {
  headerRender?: false
  footerRender?: false
  menuRender?: false
  menuHeaderRender?: false
}

export interface PureSettings {
  layout: 'side' | 'top'
  contentWidth: ContentWidth
  fixedHeader: boolean
  fixSiderbar: boolean
  menu: {
    locale?: boolean
    defaultOpenAll?: boolean
    ignoreFlatMenu?: boolean
  }
  title: string
  colorPrimary: string
  colorWeak?: boolean
  splitMenus?: boolean
}

const defaultSettings: ProSettings = {
  layout: 'side',
  contentWidth: 'Fixed',
  fixedHeader: false,
  fixSiderbar: false,
  menu: {
    locale: true,
  },
  title: 'Ant Design Pro',
  colorPrimary: '#1677FF',
}

export { defaultSettings }
