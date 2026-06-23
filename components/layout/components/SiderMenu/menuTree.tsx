import type { BaseMenuProps, MenuDataItem, NavMenuNode } from './types'
import { isVNode } from 'vue'
import { isUrl } from '../../../utils'

function normalizeMenuPath(path?: string) {
  if (path && path.indexOf('http') === 0)
    return path
  return `/${path || ''}`.replace(/\/+/g, '/')
}

function keyOf(item: MenuDataItem) {
  return String(item.key ?? item.path ?? item.name ?? '')
}

function renderIcon(icon: MenuDataItem['icon'], className: string) {
  if (!icon)
    return null
  if (typeof icon === 'function')
    return icon()
  if (typeof icon === 'string') {
    if (isUrl(icon) || /\.(svg|png|jpe?g|gif|webp)$/i.test(icon))
      return <img width={16} height={16} src={icon} alt="" class={className} data-testid="pro-layout-menu-icon-image" />
    return null
  }
  if (isVNode(icon))
    return icon
  return icon
}

function resolveMenuItemTitle(ctx: BaseMenuProps, item: MenuDataItem) {
  let text = item.name
  if (item.locale && ctx.menu?.locale !== false)
    text = ctx.formatMessage?.({ id: item.locale, defaultMessage: item.name }) ?? text
  if (ctx.menuTextRender)
    return ctx.menuTextRender(item, text, ctx)
  return text
}

function collapsedTitleLetter(title: any) {
  return typeof title === 'string' ? title.substring(0, 1).toUpperCase() : null
}

function renderLeafRow(ctx: BaseMenuProps & { baseClassName: string }, item: MenuDataItem, level: number) {
  const path = normalizeMenuPath(item.path || '/')
  const titleText = resolveMenuItemTitle(ctx, item)
  const iconNode = renderIcon(item.icon, `${ctx.baseClassName}-icon`)
  const fallbackLetter = ctx.collapsed && level === 0 ? collapsedTitleLetter(titleText) : null
  const iconCell = iconNode || fallbackLetter !== null
    ? (
        <span class={`${ctx.baseClassName}-item-icon`} data-testid="pro-layout-menu-tree-item-icon">
          {iconNode || <span>{fallbackLetter}</span>}
        </span>
      )
    : null
  const labelCell = (
    <span
      class={[
        `${ctx.baseClassName}-item-label`,
        (iconNode || fallbackLetter) && `${ctx.baseClassName}-item-text-has-icon`,
      ]}
      data-testid="pro-layout-menu-tree-item-label"
    >
      {titleText}
    </span>
  )

  let row = (
    <span
      key={path}
      data-pro-layout-nav-item-title
      class={`${ctx.baseClassName}-item-title`}
      style={{ width: '100%', display: 'inline-flex' }}
      data-testid="pro-layout-menu-tree-item-title"
      onClick={isUrl(path) ? () => window.open?.(path, '_blank') : undefined}
    >
      {iconCell}
      {labelCell}
    </span>
  )

  if (ctx.menuItemRender) {
    row = ctx.menuItemRender(
      {
        ...item,
        isUrl: isUrl(path),
        itemPath: path,
        replace: path === ctx.location?.pathname,
        onClick: () => {
          if (ctx.isMobile)
            ctx.onCollapse?.(true)
        },
        children: undefined,
      },
      row,
      ctx,
    ) as any
  }
  return row
}

function mapMenuItemToNavNode(ctx: BaseMenuProps & { baseClassName: string }, item: MenuDataItem, depth: number): NavMenuNode | null {
  if (item.hideInMenu)
    return null
  const children = item.hideChildrenInMenu ? undefined : (item.children || item.routes)
  const titleText = resolveMenuItemTitle(ctx, item)
  const iconDom = renderIcon(item.icon, `${ctx.baseClassName}-icon`)
  if (children?.length) {
    const defaultTitleRow = (
      <span class={`${ctx.baseClassName}-item-title`} data-pro-layout-nav-item-title data-testid="pro-layout-menu-tree-item-title">
        {iconDom ? <span class={`${ctx.baseClassName}-item-icon`} data-testid="pro-layout-menu-tree-item-icon">{iconDom}</span> : null}
        <span class={`${ctx.baseClassName}-item-label`} data-testid="pro-layout-menu-tree-item-label">{titleText}</span>
      </span>
    )
    const titleCell = ctx.subMenuItemRender
      ? ctx.subMenuItemRender({ ...item, isUrl: false }, defaultTitleRow, ctx)
      : defaultTitleRow
    const childNodes = mapMenuDataToNavNodes(ctx, children, depth + 1)
    if (ctx.menu?.type === 'group' && ctx.layout !== 'top' && depth === 0) {
      return { kind: 'group', key: keyOf(item), label: titleCell, children: childNodes }
    }
    return {
      kind: 'submenu',
      key: keyOf(item),
      raw: item,
      label: titleCell,
      children: childNodes,
      hasIcon: !!iconDom,
      onTitleClick: item.onTitleClick,
    }
  }
  return {
    kind: 'item',
    key: keyOf(item),
    disabled: item.disabled,
    raw: item,
    onClick: item.onTitleClick,
    label: renderLeafRow(ctx, item, depth),
  }
}

export function mapMenuDataToNavNodes(ctx: BaseMenuProps & { baseClassName: string }, items: MenuDataItem[] = [], depth = 0): NavMenuNode[] {
  return items
    .flatMap((item) => {
      if (item.flatMenu && item.children?.length)
        return mapMenuDataToNavNodes(ctx, item.children, depth)
      return [mapMenuItemToNavNode(ctx, item, depth)]
    })
    .filter(Boolean) as NavMenuNode[]
}

export function getOpenKeysFromMenuData(menuData: MenuDataItem[] = []): string[] {
  const keys: string[] = []
  const walk = (items: MenuDataItem[]) => {
    items.forEach((item) => {
      const children = item.children || item.routes
      if (children?.length) {
        keys.push(keyOf(item))
        walk(children)
      }
    })
  }
  walk(menuData)
  return keys
}
