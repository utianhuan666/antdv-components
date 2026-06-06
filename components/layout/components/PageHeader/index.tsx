import type { AvatarProps, BreadcrumbProps, TagProps } from 'antdv-next'
import type { CSSProperties, PropType, VNode, VNodeChild } from 'vue'
import type { ContentWidth } from '../PageContainer/context'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Avatar, Breadcrumb, Space } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, isVNode, onBeforeUnmount, onMounted, ref } from 'vue'
import useStyle from './style'

export interface PageHeaderProps {
  backIcon?: VNodeChild
  prefixCls?: string
  title?: VNodeChild | false
  subTitle?: VNodeChild
  style?: CSSProperties
  childrenContentStyle?: CSSProperties
  breadcrumb?: Partial<BreadcrumbProps> | VNode
  breadcrumbRender?: (
    props: PageHeaderProps,
    defaultDom: VNodeChild,
  ) => VNodeChild | false
  tags?: VNodeChild
  footer?: VNodeChild
  extra?: VNodeChild
  avatar?: AvatarProps
  onBack?: (e?: MouseEvent) => void
  className?: string
  contentWidth?: ContentWidth
  layout?: string
  ghost?: boolean
  children?: VNodeChild
}

function normalizeBreadcrumbItems(breadcrumb: any) {
  if (breadcrumb?.items?.length)
    return breadcrumb.items
  if (breadcrumb?.routes?.length) {
    return breadcrumb.routes.map((route: any) => ({
      ...route,
      title: route.title ?? route.breadcrumbName,
    }))
  }
  return undefined
}

function renderBreadcrumb(breadcrumb: Partial<BreadcrumbProps>, prefixCls: string) {
  const items = normalizeBreadcrumbItems(breadcrumb)
  if (!items?.length)
    return null

  return (
    <Breadcrumb
      {...breadcrumb as any}
      items={items}
      class={clsx(`${prefixCls}-breadcrumb`, (breadcrumb as any).class, (breadcrumb as any).className)}
      data-testid="pro-page-header-breadcrumb"
    />
  )
}

function getBackIcon(props: PageHeaderProps, direction: 'ltr' | 'rtl' | undefined = 'ltr') {
  if (props.backIcon !== undefined)
    return props.backIcon
  return direction === 'rtl' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />
}

function renderBack(
  prefixCls: string,
  hashId: string,
  backIcon?: VNodeChild,
  onBack?: (e?: MouseEvent) => void,
) {
  if (!backIcon || !onBack)
    return null

  return (
    <div class={clsx(`${prefixCls}-back`, hashId)} data-testid="pro-page-header-back">
      <div
        role="button"
        onClick={(event: MouseEvent) => onBack(event)}
        class={clsx(`${prefixCls}-back-button`, hashId)}
        data-testid="pro-page-header-back-button"
        aria-label="back"
      >
        {backIcon}
      </div>
    </div>
  )
}

function renderTitle(
  prefixCls: string,
  props: PageHeaderProps,
  direction: 'ltr' | 'rtl' | undefined,
  hashId: string,
) {
  const { title, avatar, subTitle, tags, extra, onBack } = props
  const headingPrefixCls = `${prefixCls}-heading`
  const hasHeading = title || subTitle || tags || extra
  if (!hasHeading)
    return null

  const backIconDom = renderBack(prefixCls, hashId, getBackIcon(props, direction), onBack)
  const hasTitle = backIconDom || avatar || hasHeading

  return (
    <div class={clsx(headingPrefixCls, hashId)} data-testid="pro-page-header-heading">
      {hasTitle
        ? (
            <div class={clsx(`${headingPrefixCls}-left`, hashId)} data-testid="pro-page-header-heading-left">
              {backIconDom}
              {avatar
                ? (
                    <Avatar
                      class={clsx(`${headingPrefixCls}-avatar`, hashId, (avatar as any).class, (avatar as any).className)}
                      data-testid="pro-page-header-heading-avatar"
                      {...avatar}
                    />
                  )
                : null}
              {title
                ? (
                    <span
                      class={clsx(`${headingPrefixCls}-title`, hashId)}
                      data-testid="pro-page-header-heading-title"
                      title={typeof title === 'string' ? title : undefined}
                    >
                      {title}
                    </span>
                  )
                : null}
              {subTitle
                ? (
                    <span
                      class={clsx(`${headingPrefixCls}-sub-title`, hashId)}
                      data-testid="pro-page-header-heading-sub-title"
                      title={typeof subTitle === 'string' ? subTitle : undefined}
                    >
                      {subTitle}
                    </span>
                  )
                : null}
              {tags
                ? (
                    <span class={clsx(`${headingPrefixCls}-tags`, hashId)} data-testid="pro-page-header-heading-tags">
                      {tags}
                    </span>
                  )
                : null}
            </div>
          )
        : null}
      {extra
        ? (
            <span class={clsx(`${headingPrefixCls}-extra`, hashId)} data-testid="pro-page-header-heading-extra">
              <Space>{extra}</Space>
            </span>
          )
        : null}
    </div>
  )
}

function renderFooter(prefixCls: string, footer: VNodeChild, hashId: string) {
  if (!footer)
    return null

  return (
    <div class={clsx(`${prefixCls}-footer`, hashId)} data-testid="pro-page-header-footer">
      {footer}
    </div>
  )
}

function renderChildren(prefixCls: string, children: VNodeChild, hashId: string) {
  return (
    <div class={clsx(`${prefixCls}-content`, hashId)} data-testid="pro-page-header-content">
      {children}
    </div>
  )
}

export const PageHeader = defineComponent({
  name: 'PageHeader',
  inheritAttrs: false,
  props: {
    class: String,
    className: String,
    backIcon: null as any,
    prefixCls: String,
    title: null as any,
    subTitle: null as any,
    style: Object as PropType<CSSProperties>,
    childrenContentStyle: Object as PropType<CSSProperties>,
    breadcrumb: null as any,
    breadcrumbRender: Function as PropType<PageHeaderProps['breadcrumbRender']>,
    tags: null as unknown as PropType<VNodeChild | TagProps | TagProps[]>,
    footer: null as any,
    extra: null as any,
    avatar: Object as PropType<AvatarProps>,
    onBack: Function as PropType<(e?: MouseEvent) => void>,
    contentWidth: String as PropType<ContentWidth>,
    layout: String,
    ghost: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs, slots }) {
    const compact = ref(false)
    const rootRef = ref<HTMLElement>()
    const config = useConfig()
    const prefixCls = computed(() => config.value.getPrefixCls('page-header', props.prefixCls))
    const { hashId } = useStyle(prefixCls.value)
    let resizeObserver: ResizeObserver | undefined

    onMounted(() => {
      if (typeof ResizeObserver === 'undefined' || !rootRef.value)
        return

      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? rootRef.value?.offsetWidth ?? 0
        compact.value = width < 768
      })
      resizeObserver.observe(rootRef.value)
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
    })

    return () => {
      const pageHeaderProps = props as PageHeaderProps
      const defaultBreadcrumbDom = !isVNode(props.breadcrumb)
        ? renderBreadcrumb((props.breadcrumb || {}) as Partial<BreadcrumbProps>, prefixCls.value)
        : null

      const breadcrumbRenderDomFromProps = props.breadcrumbRender?.(
        { ...pageHeaderProps, prefixCls: prefixCls.value },
        defaultBreadcrumbDom,
      ) ?? defaultBreadcrumbDom

      const breadcrumbDom = isVNode(props.breadcrumb)
        ? props.breadcrumb
        : Array.isArray(breadcrumbRenderDomFromProps) && breadcrumbRenderDomFromProps.some(item => !isVNode(item as any))
          ? renderBreadcrumb({ items: breadcrumbRenderDomFromProps as any }, prefixCls.value)
          : breadcrumbRenderDomFromProps

      const className = clsx(prefixCls.value, hashId, props.class, props.className, {
        [`${prefixCls.value}-has-breadcrumb`]: !!breadcrumbDom,
        [`${prefixCls.value}-has-footer`]: !!props.footer,
        [`${prefixCls.value}-rtl`]: config.value.direction === 'rtl',
        [`${prefixCls.value}-compact`]: compact.value,
        [`${prefixCls.value}-wide`]: props.contentWidth === 'Fixed' && props.layout === 'top',
        [`${prefixCls.value}-ghost`]: props.ghost,
      })
      const title = renderTitle(prefixCls.value, pageHeaderProps, config.value.direction, hashId)
      const children = slots.default?.()
      const childDom = children?.length ? renderChildren(prefixCls.value, children, hashId) : null
      const footerDom = renderFooter(prefixCls.value, props.footer as VNodeChild, hashId)

      if (!breadcrumbDom && !title && !footerDom && !childDom) {
        return (
          <div
            class={clsx(hashId, `${prefixCls.value}-no-children`)}
            data-testid="pro-page-header-no-children"
          />
        )
      }

      return (
        <div
          {...attrs}
          ref={rootRef}
          class={className}
          style={props.style}
          data-testid="pro-page-header"
        >
          {breadcrumbDom}
          {title}
          {childDom}
          {footerDom}
        </div>
      )
    }
  },
})

export default PageHeader
