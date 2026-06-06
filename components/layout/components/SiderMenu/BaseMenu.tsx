import type { BaseMenuProps } from './types'
import { Skeleton } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'
import { getOpenKeysFromMenuData, mapMenuDataToNavNodes } from './menuTree'
import { ProLayoutNavMenu } from './ProLayoutNavMenu'

export const BaseMenu = defineComponent<BaseMenuProps>({
  name: 'BaseMenu',
  inheritAttrs: false,
  props: [
    'prefixCls',
    'selectedKeys',
    'onSelect',
    'className',
    'collapsed',
    'splitMenus',
    'isMobile',
    'menuData',
    'mode',
    'onCollapse',
    'openKeys',
    'onOpenChange',
    'menuProps',
    'style',
    'formatMessage',
    'location',
    'layout',
    'menu',
    'postMenuData',
    'menuTextRender',
    'menuItemRender',
    'subMenuItemRender',
    'matchMenuKeys',
    'menuRenderType',
    'data-testid',
  ] as any,
  setup(props, { attrs }) {
    const mode = computed(() => props.mode || 'vertical')
    const prefixCls = computed(() => props.prefixCls || 'ant-pro')
    const baseClassName = computed(() => `${prefixCls.value}-base-menu-${mode.value}`)
    const selectedKeys = ref<string[]>(props.selectedKeys || (props as any).matchMenuKeys || [])
    const openKeys = ref<string[]>(
      props.openKeys === false
        ? []
        : props.openKeys || (props.menu?.defaultOpenAll ? getOpenKeysFromMenuData(props.menuData) : ((props as any).matchMenuKeys || [])),
    )

    watch(() => props.selectedKeys, (value) => {
      if (value)
        selectedKeys.value = value
    })
    watch(() => (props as any).matchMenuKeys, (value) => {
      if (!props.selectedKeys && value)
        selectedKeys.value = value
      if (!props.openKeys && props.openKeys !== false && value && !props.menu?.defaultOpenAll) {
        openKeys.value = props.menu?.autoClose === false
          ? Array.from(new Set([...(openKeys.value || []), ...value]))
          : value
      }
    }, { deep: true })
    watch(() => props.openKeys, (value) => {
      if (value !== undefined && value !== false)
        openKeys.value = value
    }, { deep: true })

    const resolvedMenuData = computed(() => {
      const data = props.postMenuData ? props.postMenuData(props.menuData) : props.menuData
      return data || []
    })

    const nodes = computed(() => mapMenuDataToNavNodes({ ...props, baseClassName: baseClassName.value }, resolvedMenuData.value))

    return () => {
      if (props.menu?.loading) {
        return (
          <div style={mode.value === 'horizontal' || props.collapsed ? { marginBlockStart: '16px' } : { padding: '24px' }}>
            <Skeleton active title={false} paragraph={{ rows: mode.value === 'horizontal' || props.collapsed ? 1 : 6 }} />
          </div>
        )
      }
      if (resolvedMenuData.value.length < 1)
        return null

      const { className: menuPropsClassName, style: menuPropsStyle, ...restMenuProps } = props.menuProps || {}
      const dataTestId = restMenuProps['data-testid'] || (attrs as any)['data-testid'] || (props as any)['data-testid'] || 'pro-layout-base-menu'
      delete restMenuProps['data-testid']

      return (
        <ProLayoutNavMenu
          {...restMenuProps}
          baseClassName={baseClassName.value}
          mode={mode.value}
          collapsed={props.collapsed}
          selectedKeys={selectedKeys.value}
          openKeys={openKeys.value}
          defaultOpenKeys={props.openKeys === false ? ((props as any).matchMenuKeys || []) : []}
          nodes={nodes.value}
          onOpenChange={(keys: string[]) => {
            openKeys.value = keys
            props.onOpenChange?.(keys)
          }}
          onSelect={(info) => {
            selectedKeys.value = info.selectedKeys
            props.onSelect?.(info)
          }}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            ...(props.style || {}),
            ...(menuPropsStyle || {}),
          }}
          data-testid={dataTestId}
          dataTestid={dataTestId}
          class={[
            props.className,
            menuPropsClassName,
            baseClassName.value,
            mode.value !== 'horizontal' && (props as any).menuRenderType !== 'header' && 'ant-pro-sider-menu',
          ]}
        />
      )
    }
  },
})
