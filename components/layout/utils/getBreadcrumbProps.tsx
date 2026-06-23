import type { BreadcrumbItemType, BreadcrumbProps } from 'antdv-next'
import type { ProSettings } from '../defaultSettings'
import type { MenuDataItem, MessageDescriptor, WithFalse } from '../typing'
import { match } from 'path-to-regexp'
import { urlToList } from './pathTools'

export interface BreadcrumbProLayoutProps {
  breadcrumbList?: { title: string, href: string }[]
  home?: string
  location?:
    | Location
    | {
      pathname?: string
    }
  menu?: ProSettings['menu']
  breadcrumbMap?: Map<string, MenuDataItem>
  formatMessage?: (message: MessageDescriptor) => string
  breadcrumbRender?: WithFalse<
    (routers: BreadcrumbProps['items']) => BreadcrumbProps['items']
  >
  itemRender?: BreadcrumbProps['itemRender']
}

interface ProLayoutBreadcrumbProps {
  breadcrumbProps?: {
    minLength?: number
  }
}

type BreadcrumbRouteItem = BreadcrumbItemType & {
  linkPath?: string
  breadcrumbName?: string
  component?: unknown
}

const defaultItemRender: BreadcrumbProps['itemRender'] = (route, _, routes) => {
  const { breadcrumbName, title, path } = route as BreadcrumbRouteItem

  const last
    = routes.findIndex(
      i => (i as BreadcrumbRouteItem).linkPath === route.path,
    )
    === routes.length - 1

  return last
    ? <span>{title || breadcrumbName}</span>
    : (
        <span onClick={path ? () => (location.href = path) : undefined}>
          {title || breadcrumbName}
        </span>
      )
}

function renderItemLocal(item: MenuDataItem, props: BreadcrumbProLayoutProps): string {
  const { formatMessage, menu } = props
  if (item.locale && formatMessage && menu?.locale !== false) {
    return formatMessage({ id: item.locale, defaultMessage: item.name })
  }
  return item.name as string
}

export function getBreadcrumb(breadcrumbMap: Map<string, MenuDataItem>, url: string): MenuDataItem {
  let breadcrumbItem = breadcrumbMap.get(url)
  if (!breadcrumbItem) {
    const keys: string[] = Array.from(breadcrumbMap.keys()) || []
    const targetPath = keys.find((path) => {
      try {
        if (path?.startsWith('http')) {
          return false
        }
        return match(path.replace('?', ''))(url)
      }
      catch {
        return false
      }
    })
    if (targetPath) {
      breadcrumbItem = breadcrumbMap.get(targetPath)
    }
  }
  return breadcrumbItem || { path: '' }
}

export function getBreadcrumbFromProps(props: BreadcrumbProLayoutProps): {
  location: BreadcrumbProLayoutProps['location']
  breadcrumbMap: BreadcrumbProLayoutProps['breadcrumbMap']
} {
  const { location, breadcrumbMap } = props
  return {
    location,
    breadcrumbMap,
  }
}

function conversionFromLocation(routerLocation: BreadcrumbProLayoutProps['location'], breadcrumbMap: Map<string, MenuDataItem>, props: BreadcrumbProLayoutProps): BreadcrumbProps['items'] {
  const pathSnippets = urlToList(routerLocation?.pathname)
  const extraBreadcrumbItems: BreadcrumbProps['items'] = pathSnippets
    .map((url) => {
      const currentBreadcrumb = getBreadcrumb(breadcrumbMap, url)
      const name = renderItemLocal(currentBreadcrumb, props)
      const { hideInBreadcrumb } = currentBreadcrumb
      return name && !hideInBreadcrumb
        ? {
            linkPath: url,
            breadcrumbName: name,
            title: name,
            component: currentBreadcrumb.component,
          }
        : { linkPath: '', breadcrumbName: '', title: '' }
    })
    .filter(item => item && (item as BreadcrumbRouteItem).linkPath)

  return extraBreadcrumbItems
}

export type BreadcrumbListReturn = Pick<
  BreadcrumbProps,
  Extract<keyof BreadcrumbProps, 'items' | 'itemRender'>
>

export function genBreadcrumbProps(props: BreadcrumbProLayoutProps): BreadcrumbProps['items'] {
  const { location, breadcrumbMap } = getBreadcrumbFromProps(props)

  if (location && location.pathname && breadcrumbMap) {
    return conversionFromLocation(location, breadcrumbMap, props)
  }
  return []
}

export function getBreadcrumbProps(props: Omit<BreadcrumbProLayoutProps, 'breadcrumbRender'> & {
  breadcrumbRender?: WithFalse<
    (routers: BreadcrumbProps['items']) => BreadcrumbProps['items']
  >
}, layoutPros: ProLayoutBreadcrumbProps = {}): BreadcrumbListReturn {
  const { breadcrumbRender, itemRender: propsItemRender } = props
  const { minLength = 2 } = layoutPros.breadcrumbProps || {}
  const routesArray = genBreadcrumbProps(props)
  const itemRender: BreadcrumbProps['itemRender'] = (item, ...rest) => {
    const renderFunction = propsItemRender || defaultItemRender
    return renderFunction?.(
      {
        ...item,
        path: (item as BreadcrumbRouteItem).linkPath || item.path,
      },
      ...rest,
    )
  }
  let items = routesArray
  if (breadcrumbRender) {
    items = breadcrumbRender(items || []) || undefined
  }
  if ((items && items.length < minLength) || breadcrumbRender === false) {
    items = undefined
  }
  return {
    items,
    itemRender,
  }
}
