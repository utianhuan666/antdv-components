import type { CSSProperties, VNodeChild } from 'vue'
import type { GenerateStyle } from '../../../provider'
import type { RouteContextType } from '../PageContainer/context'
import type { FooterToolBarToken } from './style'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, onMounted, onUnmounted, Teleport } from 'vue'
import { useRouteContext } from '../PageContainer/context'
import { useStyle } from './style'
import { useStylish } from './style/stylish'

export interface FooterToolbarProps {
  extra?: VNodeChild
  style?: CSSProperties
  className?: string
  renderContent?: (
    props: FooterToolbarProps & RouteContextType & { leftWidth?: string },
    dom: VNodeChild,
  ) => VNodeChild
  prefixCls?: string
  stylish?: GenerateStyle<FooterToolBarToken>
  portalDom?: boolean
  children?: VNodeChild
}

export const FooterToolbar = defineComponent({
  name: 'FooterToolbar',
  inheritAttrs: false,
  props: ['class', 'className', 'extra', 'portalDom', 'style', 'renderContent', 'prefixCls', 'stylish'],
  setup(props, { attrs, slots }) {
    const config = useConfig()
    const routeContext = useRouteContext()

    const prefixCls = props.prefixCls || config.value.getPrefixCls('pro')
    const baseClassName = `${prefixCls}-footer-bar`
    const { hashId } = useStyle(baseClassName)
    useStylish(`${baseClassName}.${baseClassName}-stylish`, {
      stylish: props.stylish,
    })
    const width = computed(() => {
      if (!routeContext.hasSiderMenu)
        return undefined
      if (!routeContext.siderWidth)
        return '100%'
      return routeContext.isMobile ? '100%' : `calc(100% - ${routeContext.siderWidth}px)`
    })

    const containerDom = typeof window === 'undefined' || typeof document === 'undefined'
      ? null
      : config.value.getTargetContainer?.() || document.body

    onMounted(() => {
      routeContext.setHasFooterToolbar?.(true)
    })

    onUnmounted(() => {
      routeContext.setHasFooterToolbar?.(false)
    })

    return () => {
      const defaultDom = [
        <div
          class={clsx(`${baseClassName}-left`, hashId)}
          data-testid="pro-layout-footer-toolbar-left"
        >
          {props.extra}
        </div>,
        <div
          class={clsx(`${baseClassName}-right`, hashId)}
          data-testid="pro-layout-footer-toolbar-right"
        >
          {slots.default?.()}
        </div>,
      ]

      const renderDom = (
        <div
          {...attrs}
          class={clsx(props.class, props.className, hashId, baseClassName, {
            [`${baseClassName}-stylish`]: !!props.stylish,
          })}
          style={{ width: width.value, ...props.style }}
          data-testid="pro-layout-footer-toolbar"
        >
          {props.renderContent
            ? props.renderContent(
                {
                  ...(props as FooterToolbarProps),
                  ...routeContext,
                  leftWidth: width.value,
                },
                defaultDom,
              )
            : defaultDom}
        </div>
      )

      if (props.portalDom === false || !containerDom)
        return renderDom

      return <Teleport to={containerDom}>{renderDom}</Teleport>
    }
  },
})

export default FooterToolbar
