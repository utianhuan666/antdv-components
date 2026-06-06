import type { App } from 'vue'
import type { FooterProps } from './components/Footer'
import type { PageContainerProps } from './components/PageContainer'
import type { PageHeaderProps } from './components/PageHeader'
import type { AppItemProps, AppListProps, BaseMenuProps, HeaderViewProps, MenuMode, ProLayoutNavMenuSelectInfo, SiderMenuProps } from './components/SiderMenu/types'
import type { ProLayoutLayoutMode, ProLayoutMenuRenderCallbackProps, ProLayoutProps } from './ProLayout'
import { DefaultFooter } from './components/Footer'
import { FooterToolbar } from './components/FooterToolbar'
import { GridContent } from './components/GridContent'
import { DefaultHeader } from './components/Header'
import { PageContainer, ProBreadcrumb, ProPageHeader } from './components/PageContainer'
import { PageHeader } from './components/PageHeader'
import { PageLoading } from './components/PageLoading'
import { SiderMenu } from './components/SiderMenu'
import { BaseMenu } from './components/SiderMenu/BaseMenu'
import { TopNavHeader } from './components/TopNavHeader'
import { RouteContext, RouteContextProvider, useRouteContext } from './context/RouteContext'
import { getPageTitle } from './getPageTitle'
import { ProLayout } from './ProLayout'
import { getMenuData } from './utils/getMenuData'

const LayoutModule = {
  install(app: App) {
    app.component('ProLayout', ProLayout)
    app.component('PageContainer', PageContainer)
    app.component('PageHeader', PageHeader)
    app.component('ProPageHeader', ProPageHeader)
    app.component('ProBreadcrumb', ProBreadcrumb)
    app.component('FooterToolbar', FooterToolbar)
  },
}

export type { ProSettings, ProSettings as Settings } from './defaultSettings'
export type { MenuDataItem, RouterTypes } from './typing'
export {
  BaseMenu,
  DefaultFooter,
  DefaultHeader,
  FooterToolbar,
  getMenuData,
  getPageTitle,
  GridContent,
  LayoutModule,
  PageContainer,
  PageHeader,
  PageLoading,
  ProBreadcrumb,
  ProLayout,
  ProPageHeader,
  RouteContext,
  RouteContextProvider,
  SiderMenu,
  TopNavHeader,
  useRouteContext,
}
export type {
  AppItemProps,
  AppListProps,
  BaseMenuProps,
  FooterProps,
  HeaderViewProps as HeaderProps,
  MenuMode,
  PageContainerProps,
  PageHeaderProps,
  ProLayoutLayoutMode,
  ProLayoutMenuRenderCallbackProps,
  ProLayoutNavMenuSelectInfo,
  ProLayoutProps,
  SiderMenuProps,
}
export default ProLayout
