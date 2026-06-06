import type { HeaderViewProps } from '../SiderMenu/types'
import { MenuOutlined } from '@antdv-next/icons'
import { defineComponent } from 'vue'
import { defaultRenderLogo } from '../AppsLogoComponents'
import { ActionsContent } from './ActionsContent'

function renderLogo(menuHeaderRender: HeaderViewProps['menuHeaderRender'], logoDom: any) {
  if (menuHeaderRender === false)
    return null
  if (menuHeaderRender)
    return menuHeaderRender(logoDom, null)
  return logoDom
}

export const GlobalHeader = defineComponent<HeaderViewProps>({
  name: 'GlobalHeader',
  inheritAttrs: false,
  props: [
    'collapsed',
    'onCollapse',
    'isMobile',
    'logo',
    'className',
    'prefixCls',
    'style',
    'menuHeaderRender',
    'actionsRender',
    'actionsPlacement',
    'avatarProps',
  ] as any,
  setup(props, { slots }) {
    return () => {
      const baseClassName = `${props.prefixCls || 'ant-pro'}-global-header`
      const logoDom = (
        <span class={[`${baseClassName}-logo`, props.isMobile && `${baseClassName}-logo-mobile`]} key="logo" data-testid="pro-layout-global-header-logo">
          <span>{defaultRenderLogo(props.logo)}</span>
        </span>
      )
      return (
        <div class={[props.className, baseClassName]} style={props.style} data-testid="pro-layout-global-header">
          {props.isMobile
            ? (
                <span
                  class={`${baseClassName}-collapsed-button`}
                  data-testid="pro-layout-global-header-collapsed-button"
                  onClick={() => props.onCollapse?.(!props.collapsed)}
                >
                  <MenuOutlined />
                </span>
              )
            : null}
          {props.isMobile ? renderLogo(props.menuHeaderRender, logoDom) : null}
          <div style={{ flex: 1 }} data-testid="pro-layout-global-header-content">
            {slots.default?.()}
          </div>
          {props.actionsPlacement !== 'sider' && (props.actionsRender || props.avatarProps)
            ? <ActionsContent {...props} />
            : null}
        </div>
      )
    }
  },
})
