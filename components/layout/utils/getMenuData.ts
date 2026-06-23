import type { MenuDataItem, MessageDescriptor, Route } from '../typing'
import { transformRoute } from '@umijs/route-utils'

function fromEntries(iterable: Map<string, MenuDataItem>) {
  return [...iterable].reduce(
    (obj: Record<string, MenuDataItem>, [key, val]) => {
      obj[key] = val
      return obj
    },
    {},
  )
}

function getMenuData(routes: Readonly<Route[]>, menu?: { locale?: boolean }, formatMessage?: (message: MessageDescriptor) => string, menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[]): {
  breadcrumb: Record<string, MenuDataItem>
  breadcrumbMap: Map<string, MenuDataItem>
  menuData: MenuDataItem[]
} {
  const { menuData, breadcrumb } = transformRoute(
    routes as any,
    menu?.locale || false,
    formatMessage,
    true,
  ) as {
    breadcrumb: Map<string, MenuDataItem>
    menuData: MenuDataItem[]
  }

  if (!menuDataRender) {
    return {
      breadcrumb: fromEntries(breadcrumb),
      breadcrumbMap: breadcrumb,
      menuData,
    }
  }
  return getMenuData(menuDataRender(menuData), menu, formatMessage, undefined)
}

export { getMenuData }
