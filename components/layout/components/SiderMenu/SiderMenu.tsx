import type { HeaderViewProps, SiderMenuProps } from './types'
import { clsx } from '@v-c/util'
import { Avatar, Drawer, LayoutSider, Space } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { AppsLogoComponents, defaultRenderLogo } from '../AppsLogoComponents'
import { CollapsedIcon } from '../CollapsedIcon'
import { BaseMenu } from './BaseMenu'
import { ProLayoutNavMenu } from './ProLayoutNavMenu'
import { getProLayoutSiderCssVarsStyle } from './style/menu'

export type HeaderRenderKey = 'menuHeaderRender' | 'headerTitleRender'

export function renderLogoAndTitle(props: SiderMenuProps, renderKey: HeaderRenderKey = 'menuHeaderRender') {
  const renderFunction = props[renderKey] as any
  if (renderFunction === false)
    return null
  const logoDom = defaultRenderLogo(props.logo)
  const titleDom = <h1>{props.title ?? 'Ant Design Pro'}</h1>
  if (renderFunction)
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props)
  if (props.isMobile)
    return null
  if (props.collapsed)
    return <a key="title">{logoDom}</a>
  return (
    <a key="title">
      {logoDom}
      {titleDom}
    </a>
  )
}

const SiderMenuInner = defineComponent<SiderMenuProps>({
  name: 'SiderMenuInner',
  inheritAttrs: false,
  props: [
    'prefixCls',
    'theme',
    'logo',
    'appList',
    'appListRender',
    'itemClick',
    'siderWidth',
    'avatarProps',
    'actionsRender',
    'actionsPlacement',
    'menuHeaderRender',
    'headerTitleRender',
    'menuFooterRender',
    'menuContentRender',
    'menuExtraRender',
    'collapsedButtonRender',
    'breakpoint',
    'onMenuHeaderClick',
    'links',
    'getContainer',
    'logoStyle',
    'hide',
    'className',
    'style',
    'fixSiderbar',
    'originCollapsed',
    'matchMenuKeys',
    'menuRenderType',
    'stylish',
    'title',
    'collapsed',
    'isMobile',
    'onCollapse',
    'menuData',
    'mode',
    'openKeys',
    'onOpenChange',
    'menuProps',
    'formatMessage',
    'location',
    'layout',
    'menu',
    'postMenuData',
    'menuTextRender',
    'menuItemRender',
    'subMenuItemRender',
    'onSelect',
  ] as any,
  setup(props) {
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const baseClassName = computed(() => `${prefixCls.value}-sider`)
    const linkMenuBaseClassName = computed(() => `${prefixCls.value}-base-menu-sider`)
    const collapsedWidth = computed(() => props.menu?.collapsedWidth ?? 64)
    const hashId = ''
    const triggerCollapse = (next: boolean) => {
      const handler = Array.isArray(props.onCollapse)
        ? props.onCollapse[props.onCollapse.length - 1]
        : props.onCollapse
      handler?.(next)
    }

    return () => {
      const hideMenuWhenCollapsedClassName = props.menu?.hideMenuWhenCollapsed && props.collapsed
        ? `${baseClassName.value}-hide-menu-collapsed`
        : null
      const headerDom = renderLogoAndTitle(props, props.menuHeaderRender !== undefined ? 'menuHeaderRender' : 'headerTitleRender')
      const extraDom = props.menuExtraRender && props.menuExtraRender(props)
      const menuDom = props.menuContentRender !== false && !(props.collapsed && props.menu?.hideMenuWhenCollapsed)
        ? (
            <BaseMenu
              {...props}
              mode="vertical"
              style={{
                width: '100%',
                minWidth: props.collapsed ? undefined : (props.siderWidth ?? 240) - 16,
              }}
              className={clsx(`${baseClassName.value}-menu`, hashId)}
              data-testid="pro-layout-sider-menu"
            />
          )
        : null
      const menuRenderDom = props.menuContentRender ? props.menuContentRender(props, menuDom) : menuDom
      const linksNodes = (props.links || []).map((node, index) => ({
        kind: 'item' as const,
        key: `link-${index}`,
        raw: { key: `link-${index}` },
        label: <span class={clsx(`${baseClassName.value}-link`, hashId)} data-testid="pro-layout-sider-link">{node}</span>,
      }))
      const avatarDom = (() => {
        if (!props.avatarProps)
          return null
        const { title, render, ...rest } = props.avatarProps as any
        const dom = (
          <div class={clsx(`${baseClassName.value}-actions-avatar`, hashId)} data-testid="pro-layout-sider-actions-avatar">
            {(rest.src || rest.srcSet || rest.icon || rest.children) ? <Avatar size={28} {...rest} /> : null}
            {title && !props.collapsed ? <span>{title}</span> : null}
          </div>
        )
        return render ? render(props.avatarProps, dom, props) : dom
      })()
      const actionsDom = props.actionsRender
        ? (
            <Space
              align="center"
              size={4}
              direction={props.collapsed ? 'vertical' : 'horizontal'}
              class={clsx(`${baseClassName.value}-actions-list`, hashId, props.collapsed && `${baseClassName.value}-actions-list-collapsed`)}
              data-testid="pro-layout-sider-actions-list"
            >
              {[props.actionsRender(props as HeaderViewProps)].flat(1).map((item, index) => (
                <div key={index} class={clsx(`${baseClassName.value}-actions-list-item`, hashId)} data-testid="pro-layout-sider-actions-list-item">
                  {item}
                </div>
              ))}
            </Space>
          )
        : null
      const actionAreaDom = props.actionsPlacement === 'header' || (!avatarDom && !actionsDom)
        ? null
        : (
            <div class={clsx(`${baseClassName.value}-actions`, hashId, props.collapsed && `${baseClassName.value}-actions-collapsed`)} data-testid="pro-layout-sider-actions">
              {avatarDom}
              {actionsDom}
            </div>
          )
      const collapsedDom = props.collapsedButtonRender === false
        ? null
        : (() => {
            const dom = (
              <CollapsedIcon
                isMobile={props.isMobile}
                collapsed={props.originCollapsed ?? props.collapsed}
                className={`${baseClassName.value}-collapsed-button`}
                data-testid="pro-layout-sider-collapsed-button"
                onClick={() => triggerCollapse(!(props.originCollapsed ?? props.collapsed))}
              />
            )
            return props.collapsedButtonRender ? props.collapsedButtonRender(props.collapsed, dom) : dom
          })()
      const menuFooterDom = props.menuFooterRender && props.menuFooterRender(props)
      const menuDomItems = (
        <>
          {headerDom
            ? (
                <div
                  data-testid="pro-layout-sider-logo"
                  class={clsx(`${baseClassName.value}-logo`, hashId, props.collapsed && `${baseClassName.value}-logo-collapsed`)}
                  onClick={(event: MouseEvent) => !props.isMobile && props.onMenuHeaderClick?.(event)}
                  id="logo"
                  style={props.logoStyle}
                >
                  {headerDom}
                  <AppsLogoComponents onItemClick={props.itemClick} appListRender={props.appListRender} appList={props.appList} prefixCls={prefixCls.value} />
                </div>
              )
            : null}
          {extraDom
            ? (
                <div class={clsx(`${baseClassName.value}-extra`, hashId, !headerDom && `${baseClassName.value}-extra-no-logo`)} data-testid="pro-layout-sider-extra">
                  {extraDom}
                </div>
              )
            : null}
          <div class={clsx(`${baseClassName.value}-menu-scroll`, hashId)} data-testid="pro-layout-sider-menu-content">
            {menuRenderDom}
          </div>
          {props.links
            ? (
                <div class={clsx(`${baseClassName.value}-links`, hashId)} data-testid="pro-layout-sider-links">
                  <ProLayoutNavMenu
                    baseClassName={linkMenuBaseClassName.value}
                    mode="vertical"
                    collapsed={props.collapsed}
                    selectedKeys={[]}
                    openKeys={[]}
                    nodes={linksNodes}
                    className={clsx(`${baseClassName.value}-link-menu`, hashId)}
                    data-testid="pro-layout-sider-link-menu"
                  />
                </div>
              )
            : null}
          {actionAreaDom}
          {menuFooterDom
            ? (
                <div class={clsx(`${baseClassName.value}-footer`, hashId, props.collapsed && `${baseClassName.value}-footer-collapsed`)} data-testid="pro-layout-sider-footer">
                  {menuFooterDom}
                </div>
              )
            : null}
        </>
      )

      return (
        <>
          {props.fixSiderbar && !props.isMobile && !hideMenuWhenCollapsedClassName
            ? (
                <div
                  style={{
                    ...getProLayoutSiderCssVarsStyle(),
                    width: props.collapsed ? collapsedWidth.value : (props.siderWidth ?? 240),
                    overflow: 'hidden',
                    flex: `0 0 ${props.collapsed ? collapsedWidth.value : (props.siderWidth ?? 240)}px`,
                    maxWidth: props.collapsed ? collapsedWidth.value : (props.siderWidth ?? 240),
                    minWidth: props.collapsed ? collapsedWidth.value : (props.siderWidth ?? 240),
                    transition: 'all 0.2s ease 0s',
                    ...props.style,
                  }}
                />
              )
            : null}
          <LayoutSider
            collapsible
            collapsed={props.collapsed}
            collapsedWidth={collapsedWidth.value}
            width={props.siderWidth ?? 240}
            theme={props.theme || 'light'}
            class={clsx(
              baseClassName.value,
              hashId,
              props.className,
              props.fixSiderbar && `${baseClassName.value}-fixed`,
              props.collapsed && `${baseClassName.value}-collapsed`,
              props.layout && !props.isMobile && `${baseClassName.value}-layout-${props.layout}`,
              `${baseClassName.value}-light`,
              props.stylish && `${baseClassName.value}-stylish`,
              hideMenuWhenCollapsedClassName,
            )}
            style={{ ...getProLayoutSiderCssVarsStyle(), ...props.style }}
            data-testid="pro-layout-sider"
          >
            {hideMenuWhenCollapsedClassName
              ? (
                  <div
                    class={clsx(`${baseClassName.value}-hide-when-collapsed`, hashId)}
                    data-testid="pro-layout-sider-hide-when-collapsed"
                    style={{ height: '100%', width: '100%', opacity: 0 }}
                  >
                    {menuDomItems}
                  </div>
                )
              : menuDomItems}
            {collapsedDom}
          </LayoutSider>
        </>
      )
    }
  },
})

export const SiderMenu = defineComponent<SiderMenuProps>({
  name: 'SiderMenu',
  inheritAttrs: false,
  props: (SiderMenuInner as any).props,
  setup(props, { attrs }) {
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const triggerCollapse = (next: boolean) => {
      const handler = Array.isArray(props.onCollapse)
        ? props.onCollapse[props.onCollapse.length - 1]
        : props.onCollapse
      handler?.(next)
    }

    return () => {
      if (props.hide)
        return null
      if (props.isMobile) {
        return (
          <Drawer
            placement="left"
            class={`${prefixCls.value}-drawer-sider`}
            data-testid="pro-layout-sider"
            open={!props.collapsed}
            onClose={() => triggerCollapse(true)}
            closable={false}
            getContainer={props.getContainer || false}
            size={props.siderWidth ?? 240}
            styles={{ body: { height: '100vh', padding: 0, display: 'flex', flexDirection: 'row' } }}
          >
            <SiderMenuInner {...attrs} {...props} prefixCls={prefixCls.value} isMobile collapsed={false} originCollapsed={props.collapsed} />
          </Drawer>
        )
      }
      return <SiderMenuInner {...attrs} {...props} prefixCls={prefixCls.value} originCollapsed={props.collapsed} />
    }
  },
})
