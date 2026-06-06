import type { BreadcrumbProps, LayoutProps } from 'antdv-next'
import type { CSSProperties, PropType, VNodeChild } from 'vue'
import type { ProLayoutNavMenuSelectInfo } from './components/SiderMenu/types'
import type { ProSettings } from './defaultSettings'
import type { GetPageTitleProps } from './getPageTitle'
import type { MenuDataItem, Route, RouterTypes, WithFalse } from './typing'
import { clsx } from '@v-c/util'
import { Layout, LayoutContent } from 'antdv-next'
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { ProConfigProvider } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import { useBreakpoint, useDocumentTitle } from '../utils'
import { Logo } from './assert/Logo'
import { DefaultFooter } from './components/Footer'
import { DefaultHeader } from './components/Header'
import { RouteContextProvider } from './components/PageContainer/context'
import { PageLoading } from './components/PageLoading'
import { SiderMenu } from './components/SiderMenu'
import { defaultSettings } from './defaultSettings'
import { getPageTitleInfo } from './getPageTitle'
import { proLayoutVar } from './style'
import { getBreadcrumbProps } from './utils/getBreadcrumbProps'
import { getMenuData } from './utils/getMenuData'
import { urlToList } from './utils/pathTools'
import { clearMenuItem } from './utils/utils'
import { WrapContent } from './WrapContent'

const SiderMenuView = SiderMenu as any
const DefaultHeaderView = DefaultHeader as any
const LayoutView = Layout as any

export type ProLayoutLayoutMode = 'side' | 'top' | 'mix'

export type ProLayoutMenuRenderCallbackProps = ProLayoutProps & {
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
  props: {
    layout: String as PropType<ProLayoutLayoutMode>,
    route: Object as PropType<Route>,
    location: Object as PropType<RouterTypes['location']>,
    selectedKeys: Array as PropType<string[]>,
    openKeys: null as any,
    onSelect: Function as PropType<ProLayoutProps['onSelect']>,
    pure: Boolean,
    logo: null as any,
    loading: Boolean,
    collapsed: Boolean,
    defaultCollapsed: Boolean,
    onCollapse: Function as PropType<ProLayoutProps['onCollapse']>,
    onPageChange: Function as PropType<ProLayoutProps['onPageChange']>,
    footerRender: null as any,
    breadcrumbRender: null as any,
    pageTitleRender: null as any,
    menuDataRender: Function as PropType<ProLayoutProps['menuDataRender']>,
    postMenuData: Function as PropType<ProLayoutProps['postMenuData']>,
    itemRender: Function as PropType<ProLayoutProps['itemRender']>,
    formatMessage: Function as PropType<ProLayoutProps['formatMessage']>,
    disableMobile: Boolean,
    contentStyle: Object as PropType<CSSProperties>,
    className: String,
    breadcrumbProps: Object as PropType<ProLayoutProps['breadcrumbProps']>,
    waterMarkProps: Object,
    actionRef: Object as PropType<ProLayoutProps['actionRef']>,
    childrenRender: null as any,
    menuItemRender: Function,
    subMenuItemRender: Function,
    menuProps: Object as PropType<Record<string, any>>,
    menuRender: null as any,
    menuContentRender: null as any,
    menuHeaderRender: null as any,
    menuFooterRender: null as any,
    menuExtraRender: null as any,
    headerRender: null as any,
    headerTitleRender: null as any,
    headerContentRender: null as any,
    headerMenuRender: null as any,
    collapsedButtonRender: null as any,
    onMenuHeaderClick: Function as PropType<ProLayoutProps['onMenuHeaderClick']>,
    links: Array as PropType<VNodeChild[]>,
    appList: Array as PropType<any[]>,
    appListRender: Function,
    itemClick: Function,
    actionsRender: null as any,
    avatarProps: [Boolean, Object] as PropType<ProLayoutProps['avatarProps']>,
    actionsPlacement: String as PropType<'header' | 'sider'>,
    siderWidth: Number,
    prefixCls: String,
    title: [String, Boolean] as PropType<ProSettings['title']>,
    contentWidth: String as PropType<ProSettings['contentWidth']>,
    fixedHeader: Boolean,
    fixSiderbar: Boolean,
    splitMenus: Boolean,
    menu: Object as PropType<ProSettings['menu']>,
    suppressSiderWhenMenuEmpty: Boolean,
    style: Object as PropType<CSSProperties>,
    bgLayoutImgList: Array as PropType<ProLayoutProps['bgLayoutImgList']>,
  },
  setup(props, { slots }) {
    const uncontrolledCollapsed = ref(props.defaultCollapsed ?? false)
    const menuRequestData = ref<MenuDataItem[] | undefined>()
    const menuRequestLoading = ref(false)
    const hasFooterToolbar = ref(false)
    const hasPageContainer = ref(0)
    const isFixedHeaderScroll = ref(false)
    const colSize = useBreakpoint()
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const proLayoutClassName = computed(() => `${prefixCls.value}-layout`)
    const basicLayoutClassName = computed(() => `${prefixCls.value}-basicLayout`)
    const hashId = ''

    const mergedSettings = computed(() => ({
      ...defaultSettings,
      ...props,
      layout: menuLayoutForPureSettings(props.layout),
      menu: {
        ...defaultSettings.menu,
        ...(props.menu || {}),
      },
    }))

    const collapsed = computed(() => props.collapsed ?? uncontrolledCollapsed.value)
    const pathname = computed(() => props.location?.pathname || '/')
    const isMobile = computed(() => (colSize.value === 'sm' || colSize.value === 'xs') && !props.disableMobile)
    const actionsPlacement = computed(() => props.actionsPlacement ?? (mergedSettings.value.layout === 'top' ? 'header' : 'sider'))
    const menuCollapsedWidth = computed(() => mergedSettings.value.menu?.collapsedWidth ?? defaultSettings.menu!.collapsedWidth!)
    const leftSiderWidth = computed(() => {
      if (mergedSettings.value.layout === 'top' || isMobile.value)
        return 0
      return collapsed.value ? menuCollapsedWidth.value : (props.siderWidth ?? 240)
    })
    const mergedLogo = computed(() => props.logo === undefined ? <Logo /> : props.logo)

    const baseMenuInfo = computed(() => {
      const routeChildren = props.route?.children || props.route?.routes || []
      return getMenuData(routeChildren, mergedSettings.value.menu, props.formatMessage, props.menuDataRender)
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
        menuRequestData.value = await request(props.menu?.params || {}, baseMenuInfo.value.menuData)
      }
      finally {
        menuRequestLoading.value = false
        props.menu?.onLoadingChange?.(false)
      }
    }

    watch(() => [props.menu?.request, props.menu?.params, baseMenuInfo.value.menuData], reloadMenu, { immediate: true, deep: true })

    const menuData = computed(() => menuRequestData.value || baseMenuInfo.value.menuData)
    const matchMenus = computed(() => findMatchMenus(menuData.value, pathname.value))
    const matchMenuKeys = computed(() => {
      if (matchMenus.value.length)
        return Array.from(new Set(matchMenus.value.map(item => item.key || item.path || '').filter(Boolean) as string[]))
      const current = findCurrentMenu(menuData.value, pathname.value)
      return current?.parentKeys?.length ? [...current.parentKeys, current.path || String(current.key)] : urlToList(pathname.value)
    })
    const pageTitleInfo = computed(() => getPageTitleInfo({
      pathname: pathname.value,
      breadcrumb: baseMenuInfo.value.breadcrumb,
      breadcrumbMap: baseMenuInfo.value.breadcrumbMap,
      menu: mergedSettings.value.menu,
      title: mergedSettings.value.title,
      formatMessage: props.formatMessage,
    }))
    const pageTitle = computed(() => {
      const info = pageTitleInfo.value
      if (props.pageTitleRender === false)
        return false
      if (props.pageTitleRender) {
        const title = props.pageTitleRender({ pathname: pathname.value, ...props }, info.title, info)
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
        return mergedSettings.value.layout !== 'top' && props.menuRender !== false && !props.pure && !(props.suppressSiderWhenMenuEmpty && clearMenuItem(menuData.value).length < 1)
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
        return props.headerRender !== false
      },
      get hasFooter() {
        return props.footerRender !== false
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
        return matchMenus.value[matchMenus.value.length - 1]
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
          breadcrumbMap: baseMenuInfo.value.breadcrumbMap,
          breadcrumbRender: props.breadcrumbRender,
          itemRender: props.itemRender,
          formatMessage: props.formatMessage,
          menu: mergedSettings.value.menu,
        }, props).items
          ? getBreadcrumbProps({
              location: { pathname: pathname.value },
              breadcrumbMap: baseMenuInfo.value.breadcrumbMap,
              breadcrumbRender: props.breadcrumbRender,
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

      const hasSiderMenu = mergedSettings.value.layout !== 'top' && props.menuRender !== false && !(props.suppressSiderWhenMenuEmpty && clearMenuItem(menuData.value).length < 1)
      const siderDom = hasSiderMenu
        ? (
            <SiderMenuView
              {...props}
              title={mergedSettings.value.title || undefined}
              logo={mergedLogo.value}
              layout={mergedSettings.value.layout}
              isMobile={isMobile.value}
              actionsPlacement={actionsPlacement.value}
              collapsed={collapsed.value}
              onCollapse={setCollapsed}
              menuData={menuData.value}
              matchMenuKeys={matchMenuKeys.value}
              menu={{ ...mergedSettings.value.menu, loading: menuRequestLoading.value || mergedSettings.value.menu?.loading }}
              siderWidth={props.siderWidth ?? 240}
              prefixCls={prefixCls.value}
            />
          )
        : null
      const menuRender = props.menuRender as any
      const menuDom = menuRender ? menuRender(props, siderDom) : siderDom

      const headerDom = props.headerRender === false
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
              isMobile={isMobile.value}
              actionsPlacement={actionsPlacement.value}
              fixedHeader={mergedSettings.value.fixedHeader}
              isFixedHeaderScroll={isFixedHeaderScroll.value}
              prefixCls={prefixCls.value}
              hasSiderMenu={hasSiderMenu}
            />
          )

      const footerDefaultDom = <DefaultFooter prefixCls={prefixCls.value} />
      const footerRender = props.footerRender as any
      const footerDom = props.footerRender === false
        ? null
        : footerRender
          ? footerRender({ ...props, hasSiderMenu }, footerDefaultDom)
          : footerDefaultDom

      return (
        <ProConfigProvider>
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
                      {props.bgLayoutImgList.map((item, index) => (
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
