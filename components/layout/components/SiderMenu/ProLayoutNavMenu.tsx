import type { MenuMode, NavMenuNode, ProLayoutNavMenuSelectInfo } from './types'
import { Popover } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'

interface Props {
  'baseClassName': string
  'mode': MenuMode
  'collapsed'?: boolean
  'selectedKeys'?: string[]
  'openKeys'?: string[]
  'defaultOpenKeys'?: string[]
  'nodes': NavMenuNode[]
  'className'?: string
  'style'?: any
  'data-testid'?: string
  'dataTestid'?: string
  'onOpenChange'?: (openKeys: string[]) => void
  'onSelect'?: (info: ProLayoutNavMenuSelectInfo) => void
}

function collectSubmenusWithSelectedChild(nodes: NavMenuNode[], selectedSet: Set<string>) {
  const result = new Set<string>()
  const walk = (items: NavMenuNode[]): boolean => {
    let hit = false
    items.forEach((node) => {
      if (node.kind === 'item' && selectedSet.has(node.key))
        hit = true
      if ((node.kind === 'submenu' || node.kind === 'group') && walk(node.children)) {
        if (node.kind === 'submenu')
          result.add(node.key)
        hit = true
      }
    })
    return hit
  }
  walk(nodes)
  return result
}

export const ProLayoutNavMenu = defineComponent<Props>({
  name: 'ProLayoutNavMenu',
  inheritAttrs: false,
  props: [
    'baseClassName',
    'mode',
    'collapsed',
    'selectedKeys',
    'openKeys',
    'defaultOpenKeys',
    'nodes',
    'className',
    'style',
    'data-testid',
    'dataTestid',
    'onOpenChange',
    'onSelect',
  ] as any,
  setup(props, { attrs }) {
    const popupOpenKey = ref<string | null>(props.defaultOpenKeys?.[0] ?? null)
    const localOpenKeys = ref<string[]>(props.openKeys || props.defaultOpenKeys || [])

    const popupMode = computed(() => props.mode === 'horizontal' || (props.mode === 'vertical' && props.collapsed))
    const selectedSet = computed(() => new Set((props.selectedKeys || []).map(String)))
    const openSet = computed(() => new Set((props.openKeys || localOpenKeys.value || []).map(String)))
    const subMenuSelectedSet = computed(() => collectSubmenusWithSelectedChild(props.nodes || [], selectedSet.value))

    const activateLeaf = (node: Extract<NavMenuNode, { kind: 'item' }>) => {
      if (node.disabled)
        return
      node.onClick?.()
      props.onSelect?.({ key: node.key, selectedKeys: [node.key] })
      popupOpenKey.value = null
    }

    const toggleInline = (key: string) => {
      const current = new Set(openSet.value)
      if (current.has(key))
        current.delete(key)
      else
        current.add(key)
      localOpenKeys.value = [...current]
      props.onOpenChange?.(localOpenKeys.value)
    }

    const renderLeaf = (node: Extract<NavMenuNode, { kind: 'item' }>, depth: number) => {
      const selected = selectedSet.value.has(node.key)
      return (
        <li
          key={node.key}
          data-pro-layout-nav-leaf
          role="none"
          class={[
            `${props.baseClassName}-item`,
            node.className,
            selected && `${props.baseClassName}-item--selected`,
            node.disabled && `${props.baseClassName}-item--disabled`,
          ]}
          data-testid="pro-layout-nav-menu-item"
          aria-disabled={node.disabled || undefined}
          aria-selected={selected || undefined}
          style={node.disabled ? undefined : { cursor: 'pointer' }}
          onClick={(event: MouseEvent) => {
            if (node.disabled)
              return
            const target = event.target as HTMLElement | null
            if (target?.closest?.('a[href],[role="link"]'))
              return
            const primary = (event.currentTarget as HTMLElement).querySelector('a[href],[role="button"],[data-testid="plain-row"]') as HTMLElement | null
            if (primary && !primary.contains(target))
              primary.click()
            activateLeaf(node)
          }}
        >
          <div
            role="menuitem"
            tabindex={node.disabled ? -1 : 0}
            class={`${props.baseClassName}-item-button`}
            data-testid="pro-layout-nav-menu-item-button"
            style={{ paddingInlineStart: depth > 0 ? `${depth * 16 + 8}px` : undefined }}
            onKeydown={(event: KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                activateLeaf(node)
              }
            }}
          >
            <span class={`${props.baseClassName}-item-title`} style={{ width: '100%', display: 'inline-flex' }} data-testid="pro-layout-nav-menu-item-title">
              {node.label}
            </span>
          </div>
        </li>
      )
    }

    function renderNode(node: NavMenuNode, depth: number, insidePopup = false): any {
      if (node.kind === 'item')
        return renderLeaf(node, depth)
      if (node.kind === 'group')
        return renderGroup(node, depth)
      return renderSubmenu(node, depth, insidePopup)
    }

    function renderGroup(node: Extract<NavMenuNode, { kind: 'group' }>, depth: number) {
      return (
        <li key={node.key} class={[`${props.baseClassName}-group`, node.className]} role="presentation" data-testid="pro-layout-nav-menu-group">
          <h3 class={`${props.baseClassName}-group-title`} data-pro-layout-nav-group-title data-testid="pro-layout-nav-menu-group-title">
            {node.label}
          </h3>
          <ul class={`${props.baseClassName}-group-list`} role="group" data-testid="pro-layout-nav-menu-group-list">
            {node.children.map(child => renderNode(child, depth))}
          </ul>
        </li>
      )
    }

    function renderPopupPanel(node: Extract<NavMenuNode, { kind: 'submenu' }>) {
      return (
        <div class={`${props.baseClassName}-submenu-popup`} data-testid="pro-layout-nav-menu-popup">
          <ul role="menu" class={`${props.baseClassName}-list`} data-pro-layout-nav-popup-panel data-testid="pro-layout-nav-menu-popup-list">
            {node.children.map(child => renderNode(child, 0, true))}
          </ul>
        </div>
      )
    }

    function renderSubmenu(node: Extract<NavMenuNode, { kind: 'submenu' }>, depth: number, insidePopup = false) {
      const isOpen = popupMode.value && !insidePopup ? popupOpenKey.value === node.key : openSet.value.has(node.key)
      const title = (
        <button
          type="button"
          class={[
            `${props.baseClassName}-submenu-title`,
            isOpen && `${props.baseClassName}-submenu-title--open`,
            node.hasIcon && `${props.baseClassName}-submenu-has-icon`,
          ]}
          data-testid={popupMode.value && !insidePopup ? 'pro-layout-nav-menu-popup-submenu-title' : 'pro-layout-nav-menu-inline-submenu-title'}
          aria-expanded={isOpen}
          aria-haspopup={popupMode.value && !insidePopup ? 'true' : undefined}
          style={{ paddingInlineStart: depth > 0 ? `${depth * 16 + 8}px` : undefined }}
          onClick={(event: MouseEvent) => {
            event.preventDefault()
            node.onTitleClick?.()
            if (popupMode.value && !insidePopup)
              popupOpenKey.value = node.key
            else
              toggleInline(node.key)
          }}
        >
          <span class={`${props.baseClassName}-item-title`} data-testid="pro-layout-nav-menu-item-title">{node.label}</span>
          <span class={`${props.baseClassName}-submenu-arrow`} data-testid="pro-layout-nav-menu-submenu-arrow" aria-hidden="true">›</span>
        </button>
      )

      return (
        <li
          key={node.key}
          role="none"
          data-pro-layout-nav-submenu
          data-pro-layout-nav-submenu-open={isOpen || undefined}
          class={[
            `${props.baseClassName}-submenu`,
            node.className,
            isOpen && `${props.baseClassName}-submenu-open`,
            node.hasIcon && `${props.baseClassName}-submenu-has-icon`,
            subMenuSelectedSet.value.has(node.key) && `${props.baseClassName}-submenu--child-selected`,
          ]}
          data-testid={popupMode.value && !insidePopup ? 'pro-layout-nav-menu-popup-submenu' : 'pro-layout-nav-menu-inline-submenu'}
        >
          {popupMode.value && !insidePopup
            ? (
                <>
                  <Popover trigger="hover" arrow={false} v-slots={{ content: () => renderPopupPanel(node) }}>
                    {title}
                  </Popover>
                  {isOpen ? renderPopupPanel(node) : null}
                </>
              )
            : title}
          {!popupMode.value || insidePopup
            ? (
                isOpen
                  ? (
                      <ul class={`${props.baseClassName}-submenu-list`} role="menu" data-testid="pro-layout-nav-menu-inline-submenu-list">
                        {node.children.map(child => renderNode(child, depth + 1, insidePopup))}
                      </ul>
                    )
                  : null
              )
            : null}
        </li>
      )
    }

    return () => (
      <nav
        data-pro-layout-nav-root
        {...attrs}
        class={[
          props.className,
          props.baseClassName,
          `${props.baseClassName}-list`,
          props.mode === 'horizontal' && `${props.baseClassName}--horizontal`,
          props.collapsed && `${props.baseClassName}--collapsed`,
        ]}
        data-testid={(props as any).dataTestid || (props as any)['data-testid'] || 'pro-layout-nav-menu'}
        style={props.style}
        role={props.mode === 'horizontal' ? 'menubar' : 'menu'}
      >
        {(props.nodes || []).map(node => renderNode(node, 0))}
      </nav>
    )
  },
})
