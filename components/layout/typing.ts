import type { HTMLAttributes, VNodeChild } from 'vue'

export interface StaticContext {
  statusCode?: number | undefined
}

export interface match<
  Params extends { [K in keyof Params]?: string } = Record<string, any>,
> {
  params: Params
  isExact: boolean
  path: string
  url: string
}

export type LinkProps = {
  to: string
  replace?: boolean
  innerRef?: unknown
  href?: string
  target?: string
  [key: string]: any
} & HTMLAttributes

export interface MenuDataItem {
  children?: MenuDataItem[]
  routes?: undefined
  hideChildrenInMenu?: boolean
  hideInMenu?: boolean
  hideInBreadcrumb?: boolean
  icon?: VNodeChild | (() => VNodeChild)
  locale?: string | false
  name?: string
  key?: string
  disabled?: boolean
  disabledTooltip?: boolean
  path?: string
  parentKeys?: string[]
  flatMenu?: boolean
  target?: string
  tooltip?: string
  [key: string]: any
}

export type Route = Omit<MenuDataItem, 'routes'> & {
  routes?: Route[]
  children?: Route[]
}

export type WithFalse<T> = T | false

export interface RouterTypes {
  computedMatch?: match<any>
  route?: Route
  location: { pathname?: string }
}

export interface MessageDescriptor {
  id: any
  description?: string
  defaultMessage?: string
}
