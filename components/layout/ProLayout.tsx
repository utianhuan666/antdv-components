import type { BreadcrumbProps, LayoutProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { ProLayoutNavMenuSelectInfo } from './components/SiderMenu/types'
import type { ProSettings } from './defaultSettings'
import type { GetPageTitleProps } from './getPageTitle'
import type { MenuDataItem, Route, RouterTypes, WithFalse } from './typing'
import { clsx } from '@v-c/util'
import { Layout, LayoutContent } from 'antdv-next'
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { ProConfigProvider } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import { omitUndefined, useBreakpoint, useDocumentTitle } from '../utils'
import { Logo } from './assert/Logo'
import { DefaultFooter } from './components/Footer'
import { DefaultHeader } from './components/Header'
import { PageLoading } from './components/PageLoading'
import { SiderMenu } from './components/SiderMenu'
import { RouteContextProvider } from './context/RouteContext'
import { defaultSettings } from './defaultSettings'
import { getPageTitleInfo } from './getPageTitle'
import { proLayoutVar, useStyle } from './style'
import { getBreadcrumbProps } from './utils/getBreadcrumbProps'
import { getMenuData } from './utils/getMenuData'
import { urlToList } from './utils/pathTools'
import { useCurrentMenuLayoutProps } from './utils/useCurrentMenuLayoutProps'
import { clearMenuItem } from './utils/utils'
import { WrapContent } from './WrapContent'

const SiderMenuView = SiderMenu as any
const DefaultHeaderView = DefaultHeader as any
const LayoutView = Layout as any

export type ProLayoutLayoutMode = 'side' | 'top' | 'mix'

export type ProLayoutMenuRenderCallbackProps = ProLayoutProps & {
  layout?: NonNullable<ProSettings['layout']>
  collapsed?: boolean
}

export type ProLayoutProps = Omit<ProSettings, 'layout'> & {
  layout?: ProLayoutLayoutMode
  route?: Route
  location?: RouterTypes['location']
  selectedKeys?: string[]
  openKeys?: WithFalse<string[]>
  onSelect?: (info: ProLayoutNavMenuSelectInfo) => void
  pure?: boolean
  logo?: VNodeChild | (() => VNodeChild) | false
  loading?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  onPageChange?: (location?: RouterTypes['location']) => void
  footerRender?: WithFalse<(props: ProLayoutProps & { hasSiderMenu?: boolean }, defaultDom: VNodeChild) => VNodeChild>
  breadcrumbRender?: WithFalse<(routers: BreadcrumbProps['items']) => BreadcrumbProps['items']>
  pageTitleRender?: WithFalse<(props: GetPageTitleProps, defaultPageTitle?: string, info?: { title: string, id: string, pageName: string }) => string>
  menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[]
  postMenuData?: (menuData?: MenuDataItem[]) => MenuDataItem[]
  itemRender?: BreadcrumbProps['itemRender']
  formatMessage?: (message: { id: any, defaultMessage?: string }) => string
  disableMobile?: boolean
  contentStyle?: CSSProperties
  className?: string
  breadcrumbProps?: BreadcrumbProps & { minLength?: number }
  waterMarkProps?: any
  actionRef?: { value?: { reload: () => void } } | { current?: { reload: () => void } }
  ErrorBoundary?: any
  childrenRender?: WithFalse<(children: VNodeChild, props: ProLayoutProps) => VNodeChild>
  menuItemRender?: any
  subMenuItemRender?: any
  menuProps?: Record<string, any>
  menuRender?: WithFalse<(props: ProLayoutProps, defaultDom: VNodeChild) => VNodeChild>
  menuContentRender?: any
  menuHeaderRender?: any
  menuFooterRender?: any
  menuExtraRender?: any
  headerRender?: any
  headerTitleRender?: any
  headerContentRender?: any
  headerMenuRender?: any
  collapsedButtonRender?: any
  onMenuHeaderClick?: (event: MouseEvent) => void
  links?: VNodeChild[]
  appList?: any[]
  appListRender?: any
  itemClick?: any
  actionsRender?: any
  avatarProps?: any
  actionsPlacement?: 'header' | 'sider'
  siderWidth?: number
  siderMenuType?: ProSettings['siderMenuType']
  prefixCls?: string
  style?: CSSProperties
  bgLayoutImgList?: { src?: string, width?: string, height?: string, left?: number, top?: number, bottom?: number, right?: number }[]
  suppressSiderWhenMenuEmpty?: boolean
} & LayoutProps

type ProLayoutChildrenRender = (children: VNodeChild, props: ProLayoutProps) => VNodeChild

function toPositionValue(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`
}

function menuLayoutForPureSettings(layout: ProLayoutLayoutMode | undefined): NonNullable<ProSettings['layout']> {
  return layout === 'mix' || layout === undefined ? 'side' : layout
}

function toMenuRenderCallbackProps(props: ProLayoutProps, layout: ProSettings['layout'], collapsed: boolean): ProLayoutMenuRenderCallbackProps {
  return {
    ...props,
    layout: menuLayoutForPureSettings(layout as ProLayoutLayoutMode),
    collapsed,
  }
}

function findCurrentMenu(menuData: MenuDataItem[], pathname?: string): MenuDataItem | undefined {
  for (const item of menuData) {
    if (item.path === pathname || item.key === pathname)
      return item
    const child = findCurrentMenu(item.children || [], pathname)
    if (child)
      return child
  }
  return undefined
}

function findMatchMenus(menuData: MenuDataItem[], pathname?: string, parents: MenuDataItem[] = []): MenuDataItem[] {
  for (const item of menuData) {
    const current = [...parents, item]
    if (item.path === pathname || item.key === pathname)
      return current
    const child = findMatchMenus(item.children || [], pathname, current)
    if (child.length)
      return child
  }
  return []
}

export const ProLayout = defineComponent({
  name: 'ProLayout',
  inheritAttrs: false,
  props: [
    'layout',
    'route',
    'location',
    'selectedKeys',
    'openKeys',
    'onSelect',
    'pure',
    'logo',
    'loading',
    'collapsed',
    'defaultCollapsed',
    'onCollapse',
    'onPageChange',
    'footerRender',
    'breadcrumbRender',
    'pageTitleRender',
    'menuDataRender',
    'postMenuData',
    'itemRender',
    'formatMessage',
    'disableMobile',
    'contentStyle',
    'className',
    'breadcrumbProps',
    'waterMarkProps',
    'actionRef',
    'childrenRender',
    'menuItemRender',
    'subMenuItemRender',
    'menuProps',
    'menuRender',
    'menuContentRender',
    'menuHeaderRender',
    'menuFooterRender',
    'menuExtraRender',
    'headerRender',
    'headerTitleRender',
    'headerContentRender',
    'headerMenuRender',
    'collapsedButtonRender',
    'onMenuHeaderClick',
    'links',
    'appList',
    'appListRender',
    'itemClick',
    'actionsRender',
    'avatarProps',
    'actionsPlacement',
    'siderWidth',
    'siderMenuType',
    'prefixCls',
    'title',
    'contentWidth',
    'fixedHeader',
    'fixSiderbar',
    'splitMenus',
    'menu',
    'suppressSiderWhenMenuEmpty',
    'style',
    'bgLayoutImgList',
  ],
  setup(props, { slots }) {
    const uncontrolledCollapsed = ref(false)
    const menuRequestData = ref<MenuDataItem[] | undefined>()
    const menuRequestLoading = ref(false)
    const hasFooterToolbar = ref(false)
    const hasPageContainer = ref(0)
    const isFixedHeaderScroll = ref(false)
    const colSize = useBreakpoint()
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const proLayoutClassName = computed(() => `${prefixCls.value}-layout`)
    const basicLayoutClassName = computed(() => `${prefixCls.value}-basicLayout`)
    const { hashId } = useStyle(proLayoutClassName.value)

    const propsSettings = computed(() => ({
      ...defaultSettings,
      ...omitUndefined(props as unknown as Record<string, any>),
      layout: menuLayoutForPureSettings(props.layout),
      menu: {
        ...defaultSettings.menu,
        ...(props.menu || {}),
        type: props.siderMenuType || props.menu?.type,
      },
    }))

    const collapsed = computed(() => props.collapsed ?? uncontrolledCollapsed.value)
    const pathname = computed(() => props.location?.pathname || '/')
    const isMobile = computed(() => (colSize.value === 'sm' || colSize.value === 'xs') && !props.disableMobile)
    watch([isMobile, colSize, () => props.defaultCollapsed], () => {
      if (props.defaultCollapsed !== undefined) {
        uncontrolledCollapsed.value = props.defaultCollapsed
        return
      }
      const env = (globalThis as any).process?.env?.NODE_ENV
      uncontrolledCollapsed.value = env === 'test' ? false : !!(isMobile.value || colSize.value === 'md')
    }, { immediate: true })
    const mergedLogo = computed(() => props.logo === undefined ? <Logo /> : props.logo)

    const baseMenuInfo = computed(() => {
      const routeChildren = props.route?.children || props.route?.routes || []
      return getMenuData(routeChildren, propsSettings.value.menu, props.formatMessage, props.menuDataRender)
    })

    async function reloadMenu() {
      const request = props.menu?.request
      if (!request) {
        menuRequestData.value = undefined
        return
      }
      menuRequestLoading.value = true
      props.menu?.onLoadingChange?.(true)
      try {
        const routeChildren = props.route?.children || props.route?.routes || []
        menuRequestData.value = await request(props.menu?.params || {}, routeChildren as MenuDataItem[])
      }
      finally {
        menuRequestLoading.value = false
        props.menu?.onLoadingChange?.(false)
      }
    }

    watch(() => [props.menu?.request, props.menu?.params, baseMenuInfo.value.menuData], reloadMenu, { immediate: true, deep: true })

    const routeListForMenu = computed(() => {
      const routeChildren = props.route?.children || props.route?.routes || []
      return props.menu?.request ? (menuRequestData.value ?? routeChildren) : routeChildren
    })
    const menuInfo = computed(() => getMenuData(routeListForMenu.value, propsSettings.value.menu, props.formatMessage, props.menuDataRender))
    const menuData = computed(() => menuInfo.value.menuData)
    const matchMenus = computed(() => findMatchMenus(menuData.value, pathname.value))
    const currentMenu = computed(() => (matchMenus.value[matchMenus.value.length - 1] || {}) as ProSettings & MenuDataItem)
    const currentMenuLayoutProps = useCurrentMenuLayoutProps(currentMenu)
    const mergedSettings = computed(() => ({
      ...propsSettings.value,
      ...(currentMenuLayoutProps.value || {}),
      layout: menuLayoutForPureSettings(((currentMenuLayoutProps.value || {}).layout as ProLayoutLayoutMode | undefined) ?? propsSettings.value.layout),
      menu: propsSettings.value.menu,
    }) as ProLayoutProps & ProSettings)
    const actionsPlacement = computed(() => props.actionsPlacement ?? (mergedSettings.value.layout === 'top' ? 'header' : 'sider'))
    const menuCollapsedWidth = computed(() => mergedSettings.value.menu?.collapsedWidth ?? defaultSettings.menu!.collapsedWidth!)
    const leftSiderWidth = computed(() => {
      if (mergedSettings.value.layout === 'top' || isMobile.value)
        return 0
      return collapsed.value ? menuCollapsedWidth.value : (props.siderWidth ?? 240)
    })
    const matchMenuKeys = computed(() => {
      if (matchMenus.value.length)
        return Array.from(new Set(matchMenus.value.map(item => item.key || item.path || '').filter(Boolean) as string[]))
      const current = findCurrentMenu(menuData.value, pathname.value)
      return current?.parentKeys?.length ? [...current.parentKeys, current.path || String(current.key)] : urlToList(pathname.value)
    })
    const pageTitleInfo = computed(() => getPageTitleInfo({
      pathname: pathname.value,
      breadcrumb: menuInfo.value.breadcrumb,
      breadcrumbMap: menuInfo.value.breadcrumbMap,
      menu: mergedSettings.value.menu,
      title: mergedSettings.value.title,
      formatMessage: props.formatMessage,
    }))
    const pageTitleProps = computed(() => ({
      pathname: pathname.value,
      ...propsSettings.value,
      ...mergedSettings.value,
      breadcrumb: menuInfo.value.breadcrumb,
      breadcrumbMap: menuInfo.value.breadcrumbMap,
    } as GetPageTitleProps))
    const pageTitle = computed(() => {
      const info = pageTitleInfo.value
      if (props.pageTitleRender === false)
        return false
      if (props.pageTitleRender) {
        const title = props.pageTitleRender(pageTitleProps.value, info.title, info)
        if (typeof title === 'string')
          return title
        return info.title
      }
      return info.title
    })

    useDocumentTitle(
      {
        get title() {
          return pageTitle.value || ''
        },
        get id() {
          return pageTitleInfo.value.id
        },
        get pageName() {
          return pageTitleInfo.value.pageName
        },
      },
      false,
    )

    onMounted(() => props.onPageChange?.(props.location))
    watch(pathname, () => props.onPageChange?.(props.location))

    watch(() => props.actionRef, (actionRef) => {
      if (!actionRef)
        return
      const action = { reload: reloadMenu }
      if ('value' in actionRef)
        actionRef.value = action
      if ('current' in actionRef)
        actionRef.current = action
      if (!('value' in actionRef) && !('current' in actionRef)) {
        ;(actionRef as any).current = action
      }
    }, { immediate: true })

    const setCollapsed = (next: boolean) => {
      uncontrolledCollapsed.value = next
      props.onCollapse?.(next)
    }

    const routeContextValue = reactive({
      get title() {
        return pageTitleInfo.value.pageName
      },
      get contentWidth() {
        return mergedSettings.value.contentWidth
      },
      get layout() {
        return mergedSettings.value.layout
      },
      get hasSiderMenu() {
        return mergedSettings.value.layout !== 'top' && mergedSettings.value.menuRender !== false && !props.pure && !(mergedSettings.value.suppressSiderWhenMenuEmpty && clearMenuItem(menuData.value).length < 1)
      },
      get isMobile() {
        return isMobile.value
      },
      get siderWidth() {
        return leftSiderWidth.value || undefined
      },
      get collapsed() {
        return collapsed.value
      },
      get fixedHeader() {
        return mergedSettings.value.fixedHeader
      },
      get hasHeader() {
        return mergedSettings.value.headerRender !== false
      },
      get hasFooter() {
        return mergedSettings.value.footerRender !== false
      },
      get hasFooterToolbar() {
        return hasFooterToolbar.value
      },
      get hasPageContainer() {
        return hasPageContainer.value
      },
      get isChildrenLayout() {
        return true
      },
      get pageTitleInfo() {
        return pageTitleInfo.value
      },
      get matchMenus() {
        return matchMenus.value
      },
      get matchMenuKeys() {
        return matchMenuKeys.value
      },
      get currentMenu() {
        return currentMenu.value
      },
      get menuData() {
        return menuData.value
      },
      get prefixCls() {
        return prefixCls.value
      },
      get breadcrumb() {
        return getBreadcrumbProps({
          location: { pathname: pathname.value },
          breadcrumbMap: menuInfo.value.breadcrumbMap,
          breadcrumbRender: mergedSettings.value.breadcrumbRender,
          itemRender: props.itemRender,
          formatMessage: props.formatMessage,
          menu: mergedSettings.value.menu,
        }, props).items
          ? getBreadcrumbProps({
              location: { pathname: pathname.value },
              breadcrumbMap: menuInfo.value.breadcrumbMap,
              breadcrumbRender: mergedSettings.value.breadcrumbRender,
              itemRender: props.itemRender,
              formatMessage: props.formatMessage,
              menu: mergedSettings.value.menu,
            }, props)
          : undefined
      },
      get breadcrumbProps() {
        return props.breadcrumbProps
      },
      get waterMarkProps() {
        return props.waterMarkProps
      },
      setHasFooterToolbar(value: boolean) {
        hasFooterToolbar.value = value
      },
      setHasPageContainer(updater: (num: number) => number) {
        hasPageContainer.value = updater(hasPageContainer.value)
      },
    })

    const onContainerScroll = (event: Event) => {
      if (!mergedSettings.value.fixedHeader)
        return
      const target = event.currentTarget as HTMLElement
      isFixedHeaderScroll.value = target.scrollTop > 56
    }

    return () => {
      const children = slots.default?.()
      if (props.loading)
        return <PageLoading />

      let childrenDom: VNodeChild = children
      const childrenRender = typeof props.childrenRender === 'function'
        ? props.childrenRender as unknown as ProLayoutChildrenRender
        : undefined
      if (childrenRender)
        childrenDom = childrenRender(children, props)

      if (props.pure) {
        return (
          <RouteContextProvider value={routeContextValue as any}>
            {childrenDom}
          </RouteContextProvider>
        )
      }

      const siderMenuData = (() => {
        if (mergedSettings.value.splitMenus && props.openKeys !== false && !isMobile.value) {
          const key = props.selectedKeys?.[0] || matchMenuKeys.value[0]
          if (key) {
            const selectedItem = menuData.value.find(item => item.key === key || item.path === key)
            const children = selectedItem?.children || []
            return children.length > 0 ? children : selectedItem ? [selectedItem] : []
          }
        }
        return menuData.value
      })()
      const hasSiderMenu = mergedSettings.value.layout !== 'top' && mergedSettings.value.menuRender !== false && !(mergedSettings.value.suppressSiderWhenMenuEmpty && clearMenuItem(siderMenuData).length < 1)
      const siderDom = hasSiderMenu
        ? (
            <SiderMenuView
              {...props}
              title={mergedSettings.value.title || undefined}
              logo={mergedLogo.value}
              layout={mergedSettings.value.layout}
              fixSiderbar={mergedSettings.value.fixSiderbar}
              isMobile={isMobile.value}
              actionsPlacement={actionsPlacement.value}
              collapsed={collapsed.value}
              onCollapse={setCollapsed}
              menuData={siderMenuData}
              matchMenuKeys={matchMenuKeys.value}
              menu={{ ...mergedSettings.value.menu, loading: menuRequestLoading.value || mergedSettings.value.menu?.loading }}
              menuHeaderRender={mergedSettings.value.menuHeaderRender}
              siderWidth={props.siderWidth ?? 240}
              prefixCls={prefixCls.value}
            />
          )
        : null
      const menuRender = mergedSettings.value.menuRender as any
      const menuDom = menuRender ? menuRender(toMenuRenderCallbackProps(props, mergedSettings.value.layout, collapsed.value), siderDom) : siderDom

      const headerDom = mergedSettings.value.headerRender === false
        ? null
        : (
            <DefaultHeaderView
              {...props}
              title={mergedSettings.value.title || undefined}
              logo={mergedLogo.value}
              collapsed={collapsed.value}
              onCollapse={setCollapsed}
              menuData={menuData.value}
              matchMenuKeys={matchMenuKeys.value}
              layout={mergedSettings.value.layout}
              headerRender={mergedSettings.value.headerRender}
              headerContentRender={mergedSettings.value.headerContentRender}
              headerMenuRender={mergedSettings.value.headerMenuRender}
              isMobile={isMobile.value}
              actionsPlacement={actionsPlacement.value}
              fixedHeader={mergedSettings.value.fixedHeader}
              isFixedHeaderScroll={isFixedHeaderScroll.value}
              prefixCls={prefixCls.value}
              hasSiderMenu={hasSiderMenu}
            />
          )

      const footerDefaultDom = <DefaultFooter prefixCls={prefixCls.value} />
      const footerRender = mergedSettings.value.footerRender as any
      const footerDom = mergedSettings.value.footerRender === false
        ? null
        : footerRender
          ? footerRender({ ...props, hasSiderMenu }, footerDefaultDom)
          : footerDefaultDom

      return (
        <ProConfigProvider token={{ colorPrimary: mergedSettings.value.colorPrimary } as any} prefixCls={props.prefixCls}>
          <RouteContextProvider value={routeContextValue as any}>
            <LayoutView
              class={clsx(
                'ant-design-pro',
                proLayoutClassName.value,
                hashId,
                basicLayoutClassName.value,
                props.className,
                `screen-${colSize.value}`,
                `${proLayoutClassName.value}-${mergedSettings.value.layout}`,
                {
                  [`${proLayoutClassName.value}-top-menu`]: mergedSettings.value.layout === 'top',
                  [`${proLayoutClassName.value}-fix-siderbar`]: mergedSettings.value.fixSiderbar,
                  [`${proLayoutClassName.value}-fixed-header`]: mergedSettings.value.fixedHeader,
                },
              )}
              data-testid="pro-layout"
              style={{
                [proLayoutVar.fixedHeaderStart]: `${leftSiderWidth.value || 0}px`,
                ...(props.style || {}),
              } as CSSProperties}
              hasSider={hasSiderMenu}
            >
              {props.bgLayoutImgList?.length
                ? (
                    <div class={clsx(`${proLayoutClassName.value}-bg-list`, hashId)} data-testid="pro-layout-bg-list">
                      {props.bgLayoutImgList.map((item: NonNullable<ProLayoutProps['bgLayoutImgList']>[number], index: number) => (
                        <img
                          key={item.src ? `${item.src}-${index}` : `bg-layout-${index}`}
                          src={item.src}
                          alt=""
                          style={{
                            position: 'absolute',
                            width: item.width,
                            height: item.height,
                            left: toPositionValue(item.left),
                            top: toPositionValue(item.top),
                            right: toPositionValue(item.right),
                            bottom: toPositionValue(item.bottom),
                          }}
                        />
                      ))}
                    </div>
                  )
                : null}
              {menuDom}
              <LayoutView class={clsx(`${proLayoutClassName.value}-container`, hashId)} data-testid="pro-layout-container" onScroll={onContainerScroll}>
                {headerDom}
                <LayoutContent class={[`${proLayoutClassName.value}-content`, `${basicLayoutClassName.value}-content`]} style={props.contentStyle}>
                  <WrapContent
                    hasPageContainer={hasPageContainer.value}
                    isChildrenLayout={routeContextValue.isChildrenLayout}
                    hasHeader={!!headerDom}
                    prefixCls={proLayoutClassName.value}
                    style={props.contentStyle}
                  >
                    {childrenDom}
                  </WrapContent>
                </LayoutContent>
                {footerDom}
                {hasFooterToolbar.value
                  ? (
                      <div
                        class={`${proLayoutClassName.value}-has-footer`}
                        data-testid="pro-layout-has-footer"
                        style={{ height: 64 }}
                      />
                    )
                  : null}
              </LayoutView>
            </LayoutView>
          </RouteContextProvider>
        </ProConfigProvider>
      )
    }
  },
})

export default ProLayout
