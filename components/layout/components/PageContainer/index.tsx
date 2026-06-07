import type {
  AffixProps,
  BreadcrumbProps,
  SpinProps,
  TabPaneProps,
  TabsProps,
  WatermarkProps,
} from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { GenerateStyle } from '../../../provider'
import type { FooterToolbarProps } from '../FooterToolbar'
import type { PageHeaderProps } from '../PageHeader'
import type { PageContainerComponentToken, PageContainerToken } from './style'
import { clsx } from '@v-c/util'
import { Affix, Breadcrumb, Tabs, Watermark } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, isVNode, onMounted, onUnmounted } from 'vue'
import { ProConfigProvider, useProProviderContext } from '../../../provider'
import { FooterToolbar } from '../FooterToolbar'
import { GridContent } from '../GridContent'
import { PageHeader } from '../PageHeader'
import { PageLoading } from '../PageLoading'
import { useRouteContext } from './context'
import { useStyle } from './style'
import { useStylish } from './style/stylish'

export interface PageHeaderTabConfig {
  tabList?: (TabPaneProps & { key?: string | number, tab?: VNodeChild })[]
  tabActiveKey?: TabsProps['activeKey']
  onTabChange?: TabsProps['onChange']
  tabBarExtraContent?: TabsProps['tabBarExtraContent']
  tabProps?: TabsProps
  fixedHeader?: boolean
}

export type PageContainerProps = {
  title?: VNodeChild | false
  content?: VNodeChild
  extraContent?: VNodeChild
  prefixCls?: string
  footer?: VNodeChild[]
  token?: PageContainerComponentToken
  header?: Partial<PageHeaderProps> & {
    children?: VNodeChild
  }
  pageHeaderRender?: false | ((props: PageContainerProps) => VNodeChild)
  affixProps?: Omit<AffixProps, 'children'>
  loading?: boolean | SpinProps | VNodeChild
  breadcrumbRender?: PageHeaderProps['breadcrumbRender'] | false
  waterMarkProps?: WatermarkProps
  breadcrumb?: BreadcrumbProps
  stylish?: GenerateStyle<PageContainerToken>
  footerStylish?: GenerateStyle<PageContainerToken>
  footerToolBarProps?: FooterToolbarProps
  className?: string
  style?: CSSProperties
  childrenContentStyle?: CSSProperties
  children?: VNodeChild
} & PageHeaderTabConfig
& Omit<PageHeaderProps, 'title' | 'footer' | 'breadcrumbRender' | 'breadcrumb'>

function genLoading(spinProps: boolean | SpinProps) {
  if (typeof spinProps === 'object')
    return spinProps

  return { spinning: spinProps }
}

function renderFooter(
  props: PageContainerProps & {
    prefixedClassName: string
    hashId: string
  },
) {
  const {
    tabList,
    tabActiveKey,
    onTabChange,
    hashId,
    tabBarExtraContent,
    tabProps,
    prefixedClassName,
  } = props

  if (Array.isArray(tabList) || tabBarExtraContent) {
    return (
      <>
        {tabBarExtraContent
          ? <div class="ant-tabs-extra-content">{tabBarExtraContent}</div>
          : null}
        <Tabs
          class={clsx(`${prefixedClassName}-tabs`, hashId)}
          data-testid="pro-page-container-tabs"
          activeKey={tabActiveKey}
          onChange={(key: string) => onTabChange?.(key)}
          items={tabList?.map((item, index) => ({
            label: item.tab,
            ...item,
            key: item.key?.toString() || index.toString(),
          })) as any}
          {...tabProps as any}
        />
      </>
    )
  }
  return null
}

function renderPageHeader(
  content: VNodeChild,
  extraContent: VNodeChild,
  prefixedClassName: string,
  hashId: string,
) {
  if (!content && !extraContent)
    return null

  return (
    <div class={clsx(`${prefixedClassName}-detail`, hashId)} data-testid="pro-page-container-detail">
      <div class={clsx(`${prefixedClassName}-main`, hashId)} data-testid="pro-page-container-main">
        <div class={clsx(`${prefixedClassName}-row`, hashId)} data-testid="pro-page-container-row">
          {content
            ? (
                <div class={clsx(`${prefixedClassName}-content`, hashId)} data-testid="pro-page-container-content">
                  {content}
                </div>
              )
            : null}
          {extraContent
            ? (
                <div class={clsx(`${prefixedClassName}-extraContent`, hashId)} data-testid="pro-page-container-extra-content">
                  {extraContent}
                </div>
              )
            : null}
        </div>
      </div>
    </div>
  )
}

export const ProBreadcrumb = defineComponent({
  name: 'ProBreadcrumb',
  props: ['items', 'separator'],
  setup(props, { attrs }) {
    const routeContext = useRouteContext()
    return () => (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          {...routeContext.breadcrumb as any}
          {...routeContext.breadcrumbProps as any}
          {...attrs}
          {...props}
        />
      </div>
    )
  },
})

const pageContainerProps = [
  'class',
  'className',
  'style',
  'childrenContentStyle',
  'title',
  'content',
  'extraContent',
  'prefixCls',
  'footer',
  'token',
  'header',
  'pageHeaderRender',
  'affixProps',
  'loading',
  'breadcrumbRender',
  'waterMarkProps',
  'breadcrumb',
  'stylish',
  'footerStylish',
  'footerToolBarProps',
  'tabList',
  'tabActiveKey',
  'onTabChange',
  'tabBarExtraContent',
  'tabProps',
  'fixedHeader',
  'ghost',
  'subTitle',
  'extra',
  'tags',
  'avatar',
  'backIcon',
  'onBack',
] as const

function memoRenderPageHeader(
  props: PageContainerProps & {
    prefixedClassName: string
    value: any
    hashId: string
  },
) {
  const {
    title,
    content,
    pageHeaderRender,
    header,
    prefixedClassName,
    extraContent,
    childrenContentStyle: _childrenContentStyle,
    style: _style,
    prefixCls,
    hashId,
    value,
    breadcrumbRender,
    className: _className,
    ...restProps
  } = props

  const getBreadcrumbRender = () => {
    if (!breadcrumbRender)
      return undefined
    return breadcrumbRender
  }

  if (pageHeaderRender === false)
    return null

  if (pageHeaderRender)
    return pageHeaderRender({ ...props, ...value })

  let pageHeaderTitle = title
  if (!title && title !== false)
    pageHeaderTitle = value.title

  const pageHeaderProps: PageHeaderProps = {
    ...value,
    title: pageHeaderTitle,
    ...restProps,
    footer: renderFooter({
      ...restProps,
      hashId,
      breadcrumbRender,
      prefixedClassName,
    }),
    ...header,
  } as PageHeaderProps

  const breadcrumb = (pageHeaderProps as { breadcrumb?: BreadcrumbProps }).breadcrumb
  const noHasBreadCrumb = (
    !breadcrumb
    || (!(breadcrumb as any).itemRender && !(breadcrumb as any).items?.length)
  ) && !breadcrumbRender && !value.breadcrumbProps?.items?.length

  if (
    ['title', 'subTitle', 'extra', 'tags', 'footer', 'avatar', 'backIcon'].every(
      item => !(pageHeaderProps as any)[item],
    )
    && noHasBreadCrumb
    && !content
    && !extraContent
  ) {
    return null
  }

  return (
    <PageHeader
      {...pageHeaderProps}
      className={clsx(`${prefixedClassName}-warp-page-header`, hashId)}
      data-testid="pro-page-container-warp-page-header"
      breadcrumb={
        breadcrumbRender === false
          ? undefined
          : { ...pageHeaderProps.breadcrumb as any, ...value.breadcrumbProps }
      }
      breadcrumbRender={getBreadcrumbRender()}
      prefixCls={prefixCls}
    >
      {header?.children || renderPageHeader(content, extraContent, prefixedClassName, hashId)}
    </PageHeader>
  )
}

const PageContainerBase = defineComponent({
  name: 'PageContainerBase',
  inheritAttrs: false,
  props: [...pageContainerProps],
  setup(props, { slots }) {
    const routeContext = useRouteContext()
    const proProviderContext = useProProviderContext()
    const config = useConfig()
    const prefixCls = props.prefixCls || config.value.getPrefixCls('pro')
    const basePageContainer = `${prefixCls}-page-container`
    const { hashId } = useStyle(basePageContainer, props.token)
    useStylish(`${basePageContainer}.${basePageContainer}-stylish`, { stylish: props.stylish })

    onMounted(() => {
      routeContext.setHasPageContainer?.(num => num + 1)
    })

    onUnmounted(() => {
      routeContext.setHasPageContainer?.(num => num - 1)
    })

    const memoBreadcrumbRender = computed(() => {
      if (props.breadcrumbRender === false)
        return false
      return props.breadcrumbRender || props.header?.breadcrumbRender
    })

    const pageHeaderDom = computed(() => memoRenderPageHeader({
      ...(props as PageContainerProps),
      breadcrumbRender: memoBreadcrumbRender.value as any,
      ghost: true,
      hashId,
      prefixCls: undefined,
      prefixedClassName: basePageContainer,
      value: routeContext,
    }))

    const loadingDom = computed(() => {
      const loading = props.loading
      if (isVNode(loading as any))
        return loading
      if (typeof loading === 'boolean' && !loading)
        return null

      const spinProps = genLoading(loading as boolean | SpinProps)
      return spinProps.spinning
        ? (
            <PageLoading {...spinProps}>
              {(spinProps as SpinProps).tip}
            </PageLoading>
          )
        : null
    })

    const content = computed(() => {
      const children = slots.default?.()
      if (!children?.length)
        return null

      return (
        <div
          class={clsx(hashId, `${basePageContainer}-children-container`, {
            [`${basePageContainer}-children-container-no-header`]: !pageHeaderDom.value,
          })}
          style={props.childrenContentStyle}
          data-testid="pro-page-container-children-container"
        >
          {children}
        </div>
      )
    })

    const renderContentDom = computed(() => {
      const dom = loadingDom.value || content.value
      if (props.waterMarkProps || routeContext.waterMarkProps) {
        const waterMarkProps = {
          ...routeContext.waterMarkProps,
          ...props.waterMarkProps,
        }
        return <Watermark {...waterMarkProps}>{dom}</Watermark>
      }
      return dom
    })

    const containerClassName = computed(() => clsx(basePageContainer, hashId, props.class, props.className, {
      [`${basePageContainer}-with-footer`]: props.footer,
      [`${basePageContainer}-with-affix`]: props.fixedHeader && pageHeaderDom.value,
      [`${basePageContainer}-stylish`]: !!props.stylish,
    }))

    const useTopFixedContentSlot = computed(() => routeContext.contentWidth === 'Fixed' && routeContext.layout === 'top')

    const mainColumn = () => [
      props.fixedHeader && pageHeaderDom.value
        ? (
            <Affix
              offsetTop={
                routeContext.hasHeader && routeContext.fixedHeader
                  ? proProviderContext.token.layout?.header?.heightLayoutHeader
                  : 1
              }
              {...props.affixProps as any}
              class={clsx(`${basePageContainer}-affix`, hashId)}
              data-testid="pro-page-container-affix"
            >
              <div class={clsx(`${basePageContainer}-warp`, hashId)} data-testid="pro-page-container-warp">
                {pageHeaderDom.value}
              </div>
            </Affix>
          )
        : pageHeaderDom.value,
      renderContentDom.value ? <GridContent>{renderContentDom.value}</GridContent> : null,
    ]

    return () => (
      <>
        <div style={props.style} class={containerClassName.value} data-testid="pro-page-container">
          {useTopFixedContentSlot.value
            ? (
                <div class={clsx(`${basePageContainer}-top-fixed-slot`, hashId)} data-testid="pro-page-container-top-fixed-slot">
                  {mainColumn()}
                </div>
              )
            : mainColumn()}
        </div>
        {props.footer
          ? (
              <FooterToolbar
                stylish={props.footerStylish as any}
                prefixCls={prefixCls}
                {...props.footerToolBarProps as any}
              >
                {props.footer}
              </FooterToolbar>
            )
          : null}
      </>
    )
  },
})

export const PageContainer = defineComponent({
  name: 'PageContainer',
  inheritAttrs: false,
  props: [...pageContainerProps],
  setup(props, { attrs, slots }) {
    return () => {
      const pageContainerBase = slots.default
        ? (
            <PageContainerBase {...props} {...attrs}>
              {slots.default()}
            </PageContainerBase>
          )
        : <PageContainerBase {...props} {...attrs} />

      return (
        <ProConfigProvider needDeps>
          {pageContainerBase}
        </ProConfigProvider>
      )
    }
  },
})

export const ProPageHeader = defineComponent({
  name: 'ProPageHeader',
  props: ['prefixedClassName'],
  setup(props, { attrs }) {
    const routeContext = useRouteContext()
    return () => memoRenderPageHeader({
      ...(attrs as PageContainerProps),
      prefixedClassName: props.prefixedClassName,
      hashId: '',
      value: routeContext,
    })
  },
})

export default PageContainer
