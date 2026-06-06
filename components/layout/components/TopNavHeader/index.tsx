import type { HeaderViewProps } from '../SiderMenu/types'
import { defineComponent } from 'vue'
import { AppsLogoComponents } from '../AppsLogoComponents'
import { ActionsContent } from '../GlobalHeader/ActionsContent'
import { BaseMenu } from '../SiderMenu/BaseMenu'
import { renderLogoAndTitle } from '../SiderMenu/SiderMenu'

export type TopNavHeaderProps = HeaderViewProps

export const TopNavHeader = defineComponent<TopNavHeaderProps>({
  name: 'TopNavHeader',
  inheritAttrs: false,
  props: [
    'onMenuHeaderClick',
    'contentWidth',
    'className',
    'style',
    'headerContentRender',
    'layout',
    'actionsRender',
    'avatarProps',
    'actionsPlacement',
    'prefixCls',
    'menuHeaderRender',
    'menuData',
    'menuProps',
    'matchMenuKeys',
    'onSelect',
    'location',
    'menuItemRender',
  ] as any,
  setup(props) {
    return () => {
      const prefixCls = `${props.prefixCls || 'ant-pro'}-top-nav-header`
      const headerDom = props.menuHeaderRender === false
        ? null
        : renderLogoAndTitle({ ...props, collapsed: false }, 'headerTitleRender')
      const defaultMenu = (
        <BaseMenu
          {...props}
          className={`${prefixCls}-base-menu`}
          data-testid="pro-layout-top-nav-header-base-menu"
          style={{ width: '100%', ...(props.menuProps?.style || {}) }}
          collapsed={false}
          menuRenderType="header"
          mode="horizontal"
        />
      )
      const contentDom = props.headerContentRender ? props.headerContentRender(props, defaultMenu) : defaultMenu
      const hasActionsContent = props.actionsPlacement !== 'sider' && (props.actionsRender || props.avatarProps)

      return (
        <div class={[prefixCls, props.className, `${prefixCls}-light`]} style={props.style} data-testid="pro-layout-top-nav-header">
          <div
            class={[`${prefixCls}-main`, props.contentWidth === 'Fixed' && props.layout === 'top' && `${prefixCls}-wide`]}
            data-testid="pro-layout-top-nav-header-main"
          >
            {headerDom
              ? (
                  <div class={`${prefixCls}-main-left`} onClick={props.onMenuHeaderClick} data-testid="pro-layout-top-nav-header-main-left">
                    <AppsLogoComponents {...props} />
                    <div class={`${prefixCls}-logo`} key="logo" id="logo" data-testid="pro-layout-top-nav-header-logo">
                      {headerDom}
                    </div>
                  </div>
                )
              : null}
            <div style={{ flex: 1 }} class={`${prefixCls}-menu`} data-testid="pro-layout-top-nav-header-menu">
              {contentDom}
            </div>
            {hasActionsContent
              ? (
                  <div data-testid="pro-layout-top-nav-header-actions" style={{ height: '100%' }}>
                    <ActionsContent {...props} prefixCls={props.prefixCls || 'ant-pro'} />
                  </div>
                )
              : null}
          </div>
        </div>
      )
    }
  },
})
