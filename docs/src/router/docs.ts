import type { RouteRecordRaw } from 'vue-router'

const PAGE_MODULES = import.meta.glob('../pages/**/*.md')

export const LOCALE_ZH_CN = 'zh-CN'
export const LOCALE_EN_US = 'en-US'
// 设置默认的语言环境
export const DEFAULT_LOCALE = LOCALE_ZH_CN

export const LOCALE_FILE_SEGMENT_ZH_CN = LOCALE_ZH_CN
export const LOCALE_FILE_SEGMENT_EN_US = LOCALE_EN_US

export const ROUTE_SUFFIX_ZH_CN = '-cn'
export const ROUTE_SUFFIX_EN_US = '-en'

const SUPPORTED_LOCALES = [LOCALE_ZH_CN, LOCALE_EN_US] as const

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

interface DocRouteInfo {
  source: string
  basePath: string
  locale: SupportedLocale
  routePath: string
  routeName: string
}

const LOCALE_ROUTE_SUFFIX: Record<SupportedLocale, string> = {
  [LOCALE_ZH_CN]: ROUTE_SUFFIX_ZH_CN,
  [LOCALE_EN_US]: ROUTE_SUFFIX_EN_US,
}

const PAGE_FILE_PREFIX = '../pages/'
const PAGE_FILE_EXTENSION = '.md'
const INDEX_PAGE_NAME = 'index'

const localePattern = new RegExp(`\\.(${SUPPORTED_LOCALES.map(escapeRegExp).join('|')})\\.md$`)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getRoutePath(basePath: string, locale: SupportedLocale) {
  const segments = basePath.split('/').filter(Boolean)
  const lastSegment = segments.at(-1)

  if (lastSegment === INDEX_PAGE_NAME) segments.pop()

  let routePath = `/${segments.join('/')}`.replace(/\/+/g, '/')
  if (routePath === '') routePath = '/'

  if (locale === DEFAULT_LOCALE) return routePath

  const suffix = LOCALE_ROUTE_SUFFIX[locale]
  return routePath === '/' ? `/${suffix.slice(1)}` : `${routePath}${suffix}`
}

function getRouteName(routePath: string) {
  return routePath.replace(/^\//, '').replace(/\//g, '-') || INDEX_PAGE_NAME
}

function normalizeRoutePath(routePath: string) {
  if (routePath === '/') return routePath
  return routePath.replace(/\/+$/, '') || '/'
}

function parsePageFile(filePath: string) {
  const localeMatch = filePath.match(localePattern)
  if (!localeMatch) return null

  const locale = localeMatch[1] as SupportedLocale
  const relativePath = filePath.slice(PAGE_FILE_PREFIX.length)
  const basePath = relativePath.replace(localePattern, '')

  return {
    locale,
    basePath,
    routePath: getRoutePath(basePath, locale),
    routeName: getRouteName(getRoutePath(basePath, locale)),
  }
}

function getDocRouteKey(basePath: string, locale: SupportedLocale) {
  return `${basePath}::${locale}`
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

const docRouteInfos = Object.entries(PAGE_MODULES).reduce<DocRouteInfo[]>((routes, [filePath]) => {
  if (!filePath.startsWith(PAGE_FILE_PREFIX) || !filePath.endsWith(PAGE_FILE_EXTENSION)) return routes

  const pageInfo = parsePageFile(filePath)
  if (!pageInfo) return routes

  routes.push({
    source: filePath,
    basePath: pageInfo.basePath,
    locale: pageInfo.locale,
    routePath: normalizeRoutePath(pageInfo.routePath),
    routeName: pageInfo.routeName,
  })

  return routes
}, [])

const docRouteInfoByPath = new Map(docRouteInfos.map((routeInfo) => [routeInfo.routePath, routeInfo]))

const docRouteInfoByBaseAndLocale = new Map(
  docRouteInfos.map((routeInfo) => [getDocRouteKey(routeInfo.basePath, routeInfo.locale), routeInfo]),
)

export function resolveDocRoutePath(path: string, locale: string) {
  if (!isSupportedLocale(locale)) return null

  const currentRoute = docRouteInfoByPath.get(normalizeRoutePath(path))
  if (!currentRoute) return null

  return docRouteInfoByBaseAndLocale.get(getDocRouteKey(currentRoute.basePath, locale))?.routePath ?? null
}

export const docsRoutes: RouteRecordRaw[] = Object.entries(PAGE_MODULES)
  .reduce<RouteRecordRaw[]>((routes, [filePath, component]) => {
    const routeInfo = docRouteInfos.find((item) => item.source === filePath)
    if (!routeInfo) return routes

    routes.push({
      path: routeInfo.routePath,
      name: routeInfo.routeName,
      component: component as RouteRecordRaw['component'],
      meta: {
        locale: routeInfo.locale,
        source: routeInfo.source,
      },
    } as RouteRecordRaw)

    return routes
  }, [])
  .sort((left, right) => left.path.localeCompare(right.path))
