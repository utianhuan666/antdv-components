import type { BreadcrumbProps, WatermarkProps } from 'antdv-next'
import type { InjectionKey, PropType, VNodeChild } from 'vue'
import { defineComponent, inject, provide } from 'vue'

export type ContentWidth = 'Fluid' | 'Fixed'

export interface RouteContextType {
  title?: VNodeChild
  contentWidth?: ContentWidth
  layout?: string
  hasSiderMenu?: boolean
  isMobile?: boolean
  siderWidth?: number
  collapsed?: boolean
  fixedHeader?: boolean
  hasHeader?: boolean
  breadcrumb?: BreadcrumbProps
  breadcrumbProps?: BreadcrumbProps
  waterMarkProps?: WatermarkProps
  setHasFooterToolbar?: (hasFooterToolbar: boolean) => void
  setHasPageContainer?: (updater: (num: number) => number) => void
}

const defaultRouteContext: RouteContextType = {
  contentWidth: 'Fluid',
  layout: 'side',
  hasSiderMenu: false,
  isMobile: false,
  fixedHeader: false,
  hasHeader: false,
}

export const RouteContextKey: InjectionKey<RouteContextType> = Symbol('RouteContext')

export function useRouteContext() {
  return inject(RouteContextKey, defaultRouteContext)
}

export function provideRouteContext(value: RouteContextType) {
  provide(RouteContextKey, value)
}

export const RouteContextProvider = defineComponent({
  name: 'RouteContextProvider',
  props: {
    value: {
      type: Object as PropType<RouteContextType>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const routeContext = {
      get title() {
        return props.value.title
      },
      get contentWidth() {
        return props.value.contentWidth ?? defaultRouteContext.contentWidth
      },
      get layout() {
        return props.value.layout ?? defaultRouteContext.layout
      },
      get hasSiderMenu() {
        return props.value.hasSiderMenu ?? defaultRouteContext.hasSiderMenu
      },
      get isMobile() {
        return props.value.isMobile ?? defaultRouteContext.isMobile
      },
      get siderWidth() {
        return props.value.siderWidth
      },
      get collapsed() {
        return props.value.collapsed
      },
      get fixedHeader() {
        return props.value.fixedHeader ?? defaultRouteContext.fixedHeader
      },
      get hasHeader() {
        return props.value.hasHeader ?? defaultRouteContext.hasHeader
      },
      get breadcrumb() {
        return props.value.breadcrumb
      },
      get breadcrumbProps() {
        return props.value.breadcrumbProps
      },
      get waterMarkProps() {
        return props.value.waterMarkProps
      },
      get setHasFooterToolbar() {
        return props.value.setHasFooterToolbar
      },
      get setHasPageContainer() {
        return props.value.setHasPageContainer
      },
    } as RouteContextType

    provide(RouteContextKey, routeContext)

    return () => slots.default?.()
  },
})
