import type { HeaderViewProps, SiderMenuProps } from './types'
import { Avatar, Drawer, LayoutSider, Space } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { AppsLogoComponents, defaultRenderLogo } from '../AppsLogoComponents'
import { CollapsedIcon } from '../CollapsedIcon'
import { BaseMenu } from './BaseMenu'
import { ProLayoutNavMenu } from './ProLayoutNavMenu'

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
    const prefixCls = computed(() => props.prefixCls || 'ant-pro')
    const baseClassName = computed(() => `${prefixCls.value}-sider`)
    const collapsedWidth = computed(() => props.menu?.collapsedWidth ?? 64)
    const triggerCollapse = (next: boolean) => {
      const handler = Array.isArray(props.onCollapse)
        ? props.onCollapse[props.onCollapse.length - 1]
        : props.onCollapse
      handler?.(next)
    }

    return () => {
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
              className={`${baseClassName.value}-menu`}
              data-testid="pro-layout-sider-menu"
            />
          )
        : null
      const menuRenderDom = props.menuContentRender ? props.menuContentRender(props, menuDom) : menuDom
      const linksNodes = (props.links || []).map((node, index) => ({
        kind: 'item' as const,
        key: `link-${index}`,
        raw: { key: `link-${index}` },
        label: <span class={`${baseClassName.value}-link`} data-testid="pro-layout-sider-link">{node}</span>,
      }))
      const avatarDom = (() => {
        if (!props.avatarProps)
          return null
        const { title, render, ...rest } = props.avatarProps as any
        const dom = (
          <div class={`${baseClassName.value}-actions-avatar`} data-testid="pro-layout-sider-actions-avatar">
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
              class={[`${baseClassName.value}-actions-list`, props.collapsed && `${baseClassName.value}-actions-list-collapsed`]}
              data-testid="pro-layout-sider-actions-list"
            >
              {[props.actionsRender(props as HeaderViewProps)].flat(1).map((item, index) => (
                <div key={index} class={`${baseClassName.value}-actions-list-item`} data-testid="pro-layout-sider-actions-list-item">
                  {item}
                </div>
              ))}
            </Space>
          )
        : null
      const actionAreaDom = props.actionsPlacement === 'header' || (!avatarDom && !actionsDom)
        ? null
        : (
            <div class={[`${baseClassName.value}-actions`, props.collapsed && `${baseClassName.value}-actions-collapsed`]} data-testid="pro-layout-sider-actions">
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

      return (
        <LayoutSider
          collapsible
          collapsed={props.collapsed}
          collapsedWidth={collapsedWidth.value}
          width={props.siderWidth ?? 240}
          theme={props.theme || 'light'}
          class={[baseClassName.value, props.className, props.collapsed && `${baseClassName.value}-collapsed`, `${baseClassName.value}-light`]}
          style={props.style}
          data-testid="pro-layout-sider"
        >
          {headerDom
            ? (
                <div
                  data-testid="pro-layout-sider-logo"
                  class={[`${baseClassName.value}-logo`, props.collapsed && `${baseClassName.value}-logo-collapsed`]}
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
                <div class={[`${baseClassName.value}-extra`, !headerDom && `${baseClassName.value}-extra-no-logo`]} data-testid="pro-layout-sider-extra">
                  {extraDom}
                </div>
              )
            : null}
          <div class={`${baseClassName.value}-menu-scroll`} data-testid="pro-layout-sider-menu-content">
            {menuRenderDom}
          </div>
          {props.links
            ? (
                <div class={`${baseClassName.value}-links`} data-testid="pro-layout-sider-links">
                  <ProLayoutNavMenu
                    baseClassName={`${prefixCls.value}-base-menu-sider`}
                    mode="vertical"
                    collapsed={props.collapsed}
                    selectedKeys={[]}
                    openKeys={[]}
                    nodes={linksNodes}
                    className={`${baseClassName.value}-link-menu`}
                    data-testid="pro-layout-sider-link-menu"
                  />
                </div>
              )
            : null}
          {actionAreaDom}
          {menuFooterDom
            ? (
                <div class={[`${baseClassName.value}-footer`, props.collapsed && `${baseClassName.value}-footer-collapsed`]} data-testid="pro-layout-sider-footer">
                  {menuFooterDom}
                </div>
              )
            : null}
          {collapsedDom}
        </LayoutSider>
      )
    }
  },
})

export const SiderMenu = defineComponent<SiderMenuProps>({
  name: 'SiderMenu',
  inheritAttrs: false,
  props: (SiderMenuInner as any).props,
  setup(props, { attrs }) {
    const triggerCollapse = (next: boolean) => {
      const handler = Array.isArray(props.onCollapse)
        ? props.onCollapse[props.onCollapse.length - 1]
        : props.onCollapse
      handler?.(next)
    }

    return () => {
      if (props.hide)
        return null
      const prefixCls = props.prefixCls || 'ant-pro'
      if (props.isMobile) {
        return (
          <Drawer
            placement="left"
            class={`${prefixCls}-drawer-sider`}
            data-testid="pro-layout-sider"
            open={!props.collapsed}
            onClose={() => triggerCollapse(true)}
            closable={false}
            getContainer={props.getContainer || false}
            size={props.siderWidth ?? 240}
            styles={{ body: { height: '100vh', padding: 0, display: 'flex', flexDirection: 'row' } }}
          >
            <SiderMenuInner {...attrs} {...props} isMobile collapsed={false} originCollapsed={props.collapsed} />
          </Drawer>
        )
      }
      return <SiderMenuInner {...attrs} {...props} originCollapsed={props.collapsed} />
    }
  },
})
