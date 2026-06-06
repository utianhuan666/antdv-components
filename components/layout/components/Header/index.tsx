import type { HeaderViewProps } from '../SiderMenu/types'
import { LayoutHeader } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { GlobalHeader } from '../GlobalHeader'
import { TopNavHeader } from '../TopNavHeader'

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
  ] as any,
  setup(props) {
    const isFixedHeaderScroll = ref(false)
    const prefixCls = computed(() => props.prefixCls || 'ant-pro')
    const baseClassName = computed(() => `${prefixCls.value}-layout-header`)
    const needFixedHeader = computed(() => props.fixedHeader || (props.splitMenus && props.layout === 'side' && !props.isMobile))

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
          class={[
            props.className,
            baseClassName.value,
            needFixedHeader.value && `${baseClassName.value}-fixed-header`,
            isFixedHeaderScroll.value && `${baseClassName.value}-fixed-header-scroll`,
            !props.collapsed && `${baseClassName.value}-fixed-header-action`,
            props.layout === 'top' && `${baseClassName.value}-top-menu`,
            `${baseClassName.value}-header`,
          ]}
          style={props.style}
          data-testid="pro-layout-header"
        >
          {renderContent()}
        </LayoutHeader>
      </>
    )
  },
})
