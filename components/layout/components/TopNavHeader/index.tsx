import type { HeaderViewProps } from '../SiderMenu/types'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
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
    const rootPrefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const prefixCls = computed(() => `${rootPrefixCls.value}-top-nav-header`)
    const hashId = ''

    return () => {
      const headerDom = props.menuHeaderRender === false
        ? null
        : renderLogoAndTitle({ ...props, collapsed: false }, 'headerTitleRender')
      const defaultMenu = (
        <BaseMenu
          {...props}
          className={clsx(`${prefixCls.value}-base-menu`, hashId)}
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
        <div class={clsx(prefixCls.value, hashId, props.className, `${prefixCls.value}-light`)} style={props.style} data-testid="pro-layout-top-nav-header">
          <div
            class={clsx(`${prefixCls.value}-main`, hashId, props.contentWidth === 'Fixed' && props.layout === 'top' && `${prefixCls.value}-wide`)}
            data-testid="pro-layout-top-nav-header-main"
          >
            {headerDom
              ? (
                  <div class={clsx(`${prefixCls.value}-main-left`, hashId)} onClick={props.onMenuHeaderClick} data-testid="pro-layout-top-nav-header-main-left">
                    <AppsLogoComponents {...props} />
                    <div class={clsx(`${prefixCls.value}-logo`, hashId)} key="logo" id="logo" data-testid="pro-layout-top-nav-header-logo">
                      {headerDom}
                    </div>
                  </div>
                )
              : null}
            <div style={{ flex: 1 }} class={clsx(`${prefixCls.value}-menu`, hashId)} data-testid="pro-layout-top-nav-header-menu">
              {contentDom}
            </div>
            {hasActionsContent
              ? (
                  <div data-testid="pro-layout-top-nav-header-actions" style={{ height: '100%' }}>
                    <ActionsContent {...props} prefixCls={prefixCls.value} />
                  </div>
                )
              : null}
          </div>
        </div>
      )
    }
  },
})
