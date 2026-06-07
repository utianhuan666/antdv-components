import type { BreadcrumbProps, WatermarkProps } from 'antdv-next'
import type { InjectionKey, VNodeChild } from 'vue'
import type { ProSettings } from '../defaultSettings'
import type { MenuDataItem } from '../typing'
import { defineComponent, inject, provide } from 'vue'

export type ContentWidth = 'Fluid' | 'Fixed'

export interface RouteContextType extends Omit<Partial<ProSettings>, 'title' | 'layout'> {
  title?: VNodeChild
  contentWidth?: ContentWidth
  layout?: ProSettings['layout']
  hasSiderMenu?: boolean
  isMobile?: boolean
  siderWidth?: number
  collapsed?: boolean
  fixedHeader?: boolean
  hasHeader?: boolean
  hasFooter?: boolean
  hasFooterToolbar?: boolean
  hasPageContainer?: number
  isChildrenLayout?: boolean
  pageTitleInfo?: {
    title: string
    id: string
    pageName: string
  }
  matchMenus?: MenuDataItem[]
  matchMenuKeys?: string[]
  currentMenu?: ProSettings & MenuDataItem
  menuData?: MenuDataItem[]
  prefixCls?: string
  breadcrumb?: BreadcrumbProps
  breadcrumbProps?: BreadcrumbProps
  waterMarkProps?: WatermarkProps
  setHasFooterToolbar?: (hasFooterToolbar: boolean) => void
  setHasPageContainer?: (updater: (num: number) => number) => void
}

const defaultRouteContext: RouteContextType = {}

export const RouteContextKey: InjectionKey<RouteContextType> = Symbol('RouteContext')
export { RouteContextKey as RouteContext }

export function useRouteContext() {
  return inject(RouteContextKey, defaultRouteContext)
}

export function provideRouteContext(value: RouteContextType) {
  provide(RouteContextKey, value)
}

export const RouteContextProvider = defineComponent({
  name: 'RouteContextProvider',
  props: ['value'],
  setup(props, { slots }) {
    const getValue = () => (props.value || {}) as RouteContextType
    const routeContext = {
      get title() {
        return getValue().title
      },
      get contentWidth() {
        return getValue().contentWidth
      },
      get layout() {
        return getValue().layout
      },
      get hasSiderMenu() {
        return getValue().hasSiderMenu
      },
      get isMobile() {
        return getValue().isMobile
      },
      get siderWidth() {
        return getValue().siderWidth
      },
      get collapsed() {
        return getValue().collapsed
      },
      get fixedHeader() {
        return getValue().fixedHeader
      },
      get hasHeader() {
        return getValue().hasHeader
      },
      get hasFooter() {
        return getValue().hasFooter
      },
      get hasFooterToolbar() {
        return getValue().hasFooterToolbar
      },
      get hasPageContainer() {
        return getValue().hasPageContainer
      },
      get isChildrenLayout() {
        return getValue().isChildrenLayout
      },
      get pageTitleInfo() {
        return getValue().pageTitleInfo
      },
      get matchMenus() {
        return getValue().matchMenus
      },
      get matchMenuKeys() {
        return getValue().matchMenuKeys
      },
      get currentMenu() {
        return getValue().currentMenu
      },
      get menuData() {
        return getValue().menuData
      },
      get prefixCls() {
        return getValue().prefixCls
      },
      get breadcrumb() {
        return getValue().breadcrumb
      },
      get breadcrumbProps() {
        return getValue().breadcrumbProps
      },
      get waterMarkProps() {
        return getValue().waterMarkProps
      },
      get setHasFooterToolbar() {
        return getValue().setHasFooterToolbar
      },
      get setHasPageContainer() {
        return getValue().setHasPageContainer
      },
    } as RouteContextType

    provide(RouteContextKey, routeContext)

    return () => slots.default?.()
  },
})
