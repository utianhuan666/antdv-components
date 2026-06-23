import type { HeaderViewProps } from '../SiderMenu/types'
import { clsx } from '@v-c/util'
import { LayoutHeader } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { GlobalHeader } from '../GlobalHeader'
import { TopNavHeader } from '../TopNavHeader'
import { useStyle } from './style/header'

export const DefaultHeader = defineComponent<HeaderViewProps>({
  name: 'DefaultHeader',
  inheritAttrs: false,
  props: [
    'isMobile',
    'fixedHeader',
    'className',
    'style',
    'collapsed',
    'prefixCls',
    'onCollapse',
    'layout',
    'headerRender',
    'headerContentRender',
    'splitMenus',
    'headerMenuRender',
    'menuData',
    'matchMenuKeys',
    'isFixedHeaderScroll',
    'stylish',
  ] as any,
  setup(props) {
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const baseClassName = computed(() => `${prefixCls.value}-layout-header`)
    const needFixedHeader = computed(() => props.fixedHeader || (props.splitMenus && props.layout === 'side' && !props.isMobile))
    const { hashId } = useStyle(baseClassName.value)

    const renderContent = () => {
      const isTop = props.layout === 'top'
      const showSideHeaderMenu = props.layout === 'side' && !props.isMobile && props.headerMenuRender !== false && (props.splitMenus || typeof props.headerMenuRender === 'function')
      const defaultSideHeaderMenu = showSideHeaderMenu
        ? <TopNavHeader {...{ ...props, layout: 'top', splitMenus: false, menuHeaderRender: false, actionsRender: false, avatarProps: false }} />
        : null
      const sideHeaderMenuDom = showSideHeaderMenu && props.headerMenuRender
        ? props.headerMenuRender(props, defaultSideHeaderMenu)
        : defaultSideHeaderMenu
      let defaultDom = (
        <GlobalHeader {...props}>
          {sideHeaderMenuDom}
          {props.headerContentRender ? props.headerContentRender(props, null) : null}
        </GlobalHeader>
      )
      if (isTop && !props.isMobile)
        defaultDom = <TopNavHeader {...{ ...props, mode: 'horizontal' }} />
      if (props.headerRender && typeof props.headerRender === 'function')
        return props.headerRender(props, defaultDom)
      return defaultDom
    }

    return () => (
      <>
        {needFixedHeader.value
          ? <LayoutHeader style={{ height: '56px', lineHeight: '56px', backgroundColor: 'transparent', zIndex: 19, ...(props.style || {}) }} />
          : null}
        <LayoutHeader
          class={clsx(
            props.className,
            hashId,
            baseClassName.value,
            needFixedHeader.value && `${baseClassName.value}-fixed-header`,
            (props as any).isFixedHeaderScroll && `${baseClassName.value}-fixed-header-scroll`,
            !props.collapsed && `${baseClassName.value}-fixed-header-action`,
            props.layout === 'top' && `${baseClassName.value}-top-menu`,
            `${baseClassName.value}-header`,
            (props as any).stylish && `${baseClassName.value}-stylish`,
          )}
          style={props.style}
          data-testid="pro-layout-header"
        >
          {renderContent()}
        </LayoutHeader>
      </>
    )
  },
})
