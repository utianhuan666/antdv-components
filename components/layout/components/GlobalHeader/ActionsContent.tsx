import type { HeaderViewProps } from '../SiderMenu/types'
import { Avatar, Space } from 'antdv-next'
import { computed, defineComponent } from 'vue'

export const ActionsContent = defineComponent<HeaderViewProps>({
  name: 'ActionsContent',
  props: [
    'avatarProps',
    'actionsRender',
    'isMobile',
    'prefixCls',
  ] as any,
  setup(props) {
    const prefixCls = computed(() => `${props.prefixCls || 'ant-pro'}-global-header`)
    const avatarDom = computed(() => {
      const avatarProps = props.avatarProps
      if (!avatarProps)
        return null
      const { title, render, ...rest } = avatarProps as any
      const dom = (
        <div>
          {(rest.src || rest.srcSet || rest.icon || rest.children) ? <Avatar {...rest} size={28} /> : null}
          {!props.isMobile && title ? <span style={{ marginInlineStart: '8px' }}>{title}</span> : null}
        </div>
      )
      return render ? render(avatarProps, dom, props as HeaderViewProps) : dom
    })

    return () => {
      const doms = props.actionsRender ? [props.actionsRender(props as HeaderViewProps)].flat(1).filter(Boolean) : []
      if (!doms.length && !avatarDom.value)
        return null
      return (
        <div class={`${prefixCls.value}-right-content`} style={{ height: '100%' }} data-testid="pro-layout-global-header-right-content">
          <Space align="center" size={4} class={`${prefixCls.value}-header-actions`} data-testid="pro-layout-global-header-actions">
            {doms.map((dom, index) => (
              <div key={index} class={`${prefixCls.value}-header-actions-item`} data-testid="pro-layout-global-header-actions-item">
                {dom}
              </div>
            ))}
            {avatarDom.value
              ? (
                  <span class={`${prefixCls.value}-header-actions-avatar`} data-testid="pro-layout-global-header-actions-avatar">
                    {avatarDom.value}
                  </span>
                )
              : null}
          </Space>
        </div>
      )
    }
  },
})
