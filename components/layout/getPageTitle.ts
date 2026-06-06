import type { ProSettings } from './defaultSettings'
import type { MenuDataItem } from './typing'
import { match } from 'path-to-regexp'

type BreadcrumbItem = Omit<MenuDataItem, 'children' | 'routes'> & {
  routes?: BreadcrumbItem
}

export function matchParamsPath(pathname: string, breadcrumb?: Record<string, BreadcrumbItem>, breadcrumbMap?: Map<string, BreadcrumbItem>): BreadcrumbItem {
  if (breadcrumbMap) {
    const pathKey = [...breadcrumbMap.keys()].find((key) => {
      try {
        if (key.startsWith('http')) {
          return false
        }
        return match(key)(pathname)
      }
      catch {
        return false
      }
    })
    if (pathKey) {
      return breadcrumbMap.get(pathKey) as BreadcrumbItem
    }
  }

  if (breadcrumb) {
    const pathKey = Object.keys(breadcrumb).find((key) => {
      try {
        if (key?.startsWith('http')) {
          return false
        }
        return match(key)(pathname)
      }
      catch {
        return false
      }
    })

    if (pathKey) {
      return breadcrumb[pathKey] as BreadcrumbItem
    }
  }

  return {
    path: '',
  }
}

export interface GetPageTitleProps {
  pathname?: string
  breadcrumb?: Record<string, BreadcrumbItem>
  breadcrumbMap?: Map<string, BreadcrumbItem>
  menu?: ProSettings['menu']
  title?: ProSettings['title']
  pageName?: string
  formatMessage?: (data: { id: any, defaultMessage?: string }) => string
}

export function getPageTitleInfo(props: GetPageTitleProps, ignoreTitle?: boolean): {
  title: string
  id: string
  pageName: string
} {
  const {
    pathname = '/',
    breadcrumb,
    breadcrumbMap,
    formatMessage,
    title,
    menu = {
      locale: false,
    },
  } = props
  const pageTitle = ignoreTitle ? '' : title || ''
  const currRouterData = matchParamsPath(pathname, breadcrumb, breadcrumbMap)
  if (!currRouterData) {
    return {
      title: pageTitle,
      id: '',
      pageName: pageTitle,
    }
  }
  let pageName = currRouterData.name

  if (menu.locale !== false && currRouterData.locale && formatMessage) {
    pageName = formatMessage({
      id: currRouterData.locale || '',
      defaultMessage: currRouterData.name,
    })
  }

  if (!pageName) {
    return {
      title: pageTitle,
      id: currRouterData.locale || '',
      pageName: pageTitle,
    }
  }
  if (ignoreTitle || !title) {
    return {
      title: pageName,
      id: currRouterData.locale || '',
      pageName,
    }
  }
  return {
    title: `${pageName} - ${title}`,
    id: currRouterData.locale || '',
    pageName,
  }
}

export function getPageTitle(props: GetPageTitleProps, ignoreTitle?: boolean) {
  return getPageTitleInfo(props, ignoreTitle).title
}
