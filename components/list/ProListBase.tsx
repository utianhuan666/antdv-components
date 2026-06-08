import type { PaginationProps } from 'antdv-next'
import type { CSSProperties, HTMLAttributes, InjectionKey, VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { Empty, Pagination, Spin, useBreakpoint } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, Fragment, inject, provide, ref } from 'vue'
import { useStyle } from './style'

export type ColumnCount = number
export type ColumnType = 'gutter' | 'column' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export interface ListGridType {
  gutter?: number | [number, number]
  column?: ColumnCount
  xs?: ColumnCount
  sm?: ColumnCount
  md?: ColumnCount
  lg?: ColumnCount
  xl?: ColumnCount
  xxl?: ColumnCount
}

export type ListSize = 'small' | 'default' | 'large'
export type ListItemLayout = 'horizontal' | 'vertical'

export interface ListLocale {
  emptyText?: VNodeChild
}

export interface ListProps<T = any> {
  variant?: 'outlined' | 'borderless' | 'filled'
  class?: any
  className?: any
  rootClassName?: any
  style?: CSSProperties
  children?: VNodeChild
  dataSource?: T[] | null
  extra?: VNodeChild
  grid?: ListGridType
  id?: string
  itemLayout?: ListItemLayout
  loading?: boolean | { spinning?: boolean }
  loadMore?: VNodeChild
  pagination?: PaginationProps | false
  prefixCls?: string
  rowKey?: ((item: T) => string | number) | keyof T
  renderItem?: (item: T, index: number, defaultDom: VNodeChild | null) => VNodeChild
  size?: ListSize
  split?: boolean
  header?: VNodeChild
  footer?: VNodeChild
  locale?: ListLocale
  hashId?: string
  suppressContainerDataSlice?: boolean
}

export const ProListContext: InjectionKey<{
  grid?: ListGridType
  itemLayout?: ListItemLayout
}> = Symbol('ProListContext')

function useProListContext() {
  return inject(ProListContext, {})
}

export interface ListItemMetaProps {
  avatar?: VNodeChild
  class?: any
  className?: any
  children?: VNodeChild
  description?: VNodeChild
  prefixCls?: string
  style?: CSSProperties
  title?: VNodeChild
}

export const ProListItemMeta = defineComponent<ListItemMetaProps>({
  name: 'ProListItemMeta',
  inheritAttrs: false,
  props: [
    'avatar',
    'class',
    'className',
    'children',
    'description',
    'prefixCls',
    'style',
    'title',
  ],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const config = useConfig()
    return () => {
      const prefixCls = config.value.getPrefixCls('pro-list', props.prefixCls)
      const title = slots.title?.() ?? props.title
      const description = slots.description?.() ?? props.description
      const content = title || description
        ? (
            <div class={`${prefixCls}-item-meta-content`}>
              {title ? <h4 class={`${prefixCls}-item-meta-title`}>{title}</h4> : null}
              {description ? <div class={`${prefixCls}-item-meta-description`}>{description}</div> : null}
            </div>
          )
        : null

      return (
        <div {...attrs} class={clsx(`${prefixCls}-item-meta`, props.class, props.className)} style={props.style}>
          {props.avatar ? <div class={`${prefixCls}-item-meta-avatar`}>{props.avatar}</div> : null}
          {content}
          {slots.default?.()}
        </div>
      )
    }
  },
})

export interface ListItemProps extends HTMLAttributes {
  class?: any
  className?: any
  children?: VNodeChild
  prefixCls?: string
  style?: CSSProperties
  extra?: VNodeChild
  actions?: VNodeChild[]
}

const InternalProListItem = defineComponent<ListItemProps>({
  name: 'ProListItem',
  inheritAttrs: false,
  props: [
    'class',
    'className',
    'children',
    'prefixCls',
    'style',
    'extra',
    'actions',
  ],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const context = useProListContext()
    const config = useConfig()

    return () => {
      const prefixCls = config.value.getPrefixCls('pro-list', props.prefixCls)
      const actions = props.actions || []
      const actionsContent = actions.length
        ? (
            <div
              key="actions"
              class={`${prefixCls}-item-action`}
              onClick={(event: MouseEvent) => event.stopPropagation()}
            >
              {actions.map((action, index) => (
                <div key={index} class={`${prefixCls}-item-action-item`}>
                  {action}
                </div>
              ))}
            </div>
          )
        : null
      const isVerticalWithExtra = context.itemLayout === 'vertical' && props.extra != null
      const extraContent = props.extra != null
        ? <div class={`${prefixCls}-item-extra`} key="extra">{props.extra}</div>
        : null
      const children = slots.default?.() ?? props.children
      const mainContent = (
        <div class={`${prefixCls}-item-main`} key="main">
          {children}
          {actionsContent}
          {!isVerticalWithExtra ? extraContent : null}
        </div>
      )
      const itemChildren = (
        <div
          {...attrs}
          class={clsx(`${prefixCls}-item`, props.class, props.className)}
          style={props.style}
        >
          {mainContent}
          {isVerticalWithExtra ? extraContent : null}
        </div>
      )

      if (context.grid) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {itemChildren}
          </div>
        )
      }
      return itemChildren
    }
  },
})

export const ProListItem = Object.assign(InternalProListItem, {
  Meta: ProListItemMeta,
})

function getRowKey<T>(item: T, index: number, rowKey?: ListProps<T>['rowKey']) {
  if (typeof rowKey === 'function')
    return rowKey(item)
  if (rowKey && typeof item === 'object' && item !== null && rowKey in item)
    return (item as Record<string, any>)[rowKey as string] as string | number
  if (typeof item === 'object' && item !== null && 'key' in item)
    return (item as { key?: string | number }).key
  return `list-item-${index}`
}

const defaultPaginationProps = {
  current: 1,
  total: 0,
  position: 'bottom' as const,
}

const DEFAULT_SCREENS = {
  xs: true,
  sm: true,
  md: true,
  lg: false,
  xl: false,
  xxl: false,
}

export const ProListContainer = defineComponent<ListProps>({
  name: 'ProListContainer',
  inheritAttrs: false,
  props: [
    'variant',
    'class',
    'className',
    'rootClassName',
    'style',
    'children',
    'dataSource',
    'extra',
    'grid',
    'id',
    'itemLayout',
    'loading',
    'loadMore',
    'pagination',
    'prefixCls',
    'rowKey',
    'renderItem',
    'size',
    'split',
    'header',
    'footer',
    'locale',
    'hashId',
    'suppressContainerDataSlice',
  ],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const config = useConfig()
    const screensRef = useBreakpoint()
    const paginationCurrent = ref((props.pagination && typeof props.pagination === 'object' ? (props.pagination.defaultCurrent ?? props.pagination.current) : undefined) ?? 1)
    const paginationSize = ref((props.pagination && typeof props.pagination === 'object' ? (props.pagination.defaultPageSize ?? props.pagination.pageSize) : undefined) ?? 10)
    let paginationEventHandled = false

    const dataSource = computed(() => Array.isArray(props.dataSource) ? props.dataSource : [])
    const prefixCls = computed(() => config.value.getPrefixCls('pro-list', props.prefixCls))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const isLoading = computed(() => typeof props.loading === 'boolean' ? props.loading : !!props.loading?.spinning)
    const paginationProps = computed(() => {
      const paginationObj = props.pagination && typeof props.pagination === 'object' ? props.pagination : {}
      return {
        ...defaultPaginationProps,
        total: dataSource.value.length,
        ...paginationObj,
        current: paginationCurrent.value,
        pageSize: paginationSize.value,
      } as PaginationProps & { position?: 'top' | 'bottom' | 'both' }
    })
    const currentPage = computed(() => {
      const pageSize = paginationProps.value.pageSize || 10
      const largestPage = Math.ceil((paginationProps.value.total || 0) / pageSize)
      return Math.min(paginationProps.value.current || 1, Math.max(1, largestPage))
    })
    const splitDataSource = computed(() => {
      if (!props.pagination || !dataSource.value.length)
        return dataSource.value
      if (props.suppressContainerDataSlice)
        return dataSource.value
      const pageSize = paginationProps.value.pageSize || 10
      const total = paginationProps.value.total || 0
      if (total > 0 && dataSource.value.length <= pageSize && total > dataSource.value.length)
        return dataSource.value
      const start = (currentPage.value - 1) * pageSize
      return dataSource.value.slice(start, start + pageSize)
    })
    const responsiveColumn = computed(() => {
      const grid = props.grid
      if (!grid)
        return 1
      const rawScreens = screensRef.value
      const screens = rawScreens == null
        ? DEFAULT_SCREENS
        : {
            xxl: rawScreens.xxl ?? DEFAULT_SCREENS.xxl,
            xl: rawScreens.xl ?? DEFAULT_SCREENS.xl,
            lg: rawScreens.lg ?? DEFAULT_SCREENS.lg,
            md: rawScreens.md ?? DEFAULT_SCREENS.md,
            sm: rawScreens.sm ?? DEFAULT_SCREENS.sm,
            xs: rawScreens.xs ?? DEFAULT_SCREENS.xs,
          }
      const responsiveArray: Array<'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'> = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
      for (const breakpoint of responsiveArray) {
        if (screens[breakpoint] && grid[breakpoint] !== undefined)
          return grid[breakpoint] as number
      }
      return grid.column || 1
    })
    const gridContainerStyle = computed<CSSProperties | undefined>(() => {
      const grid = props.grid
      if (!grid)
        return undefined
      const style: CSSProperties = { display: 'flex', flexWrap: 'wrap' }
      if (grid.gutter) {
        const [horizontal, vertical] = Array.isArray(grid.gutter) ? grid.gutter : [grid.gutter, grid.gutter]
        style.marginInline = `${-(Number(horizontal) || 0) / 2}px`
        style.marginBlock = `${-(Number(vertical) || 0) / 2}px`
      }
      return style
    })
    const colStyle = computed<CSSProperties | undefined>(() => {
      const grid = props.grid
      if (!grid)
        return undefined
      const style: CSSProperties = { display: 'flex' }
      if (grid.gutter) {
        const [horizontal, vertical] = Array.isArray(grid.gutter) ? grid.gutter : [grid.gutter, grid.gutter]
        style.paddingInline = `${(Number(horizontal) || 0) / 2}px`
        style.paddingBlock = `${(Number(vertical) || 0) / 2}px`
      }
      if (responsiveColumn.value > 0) {
        const percentage = 100 / responsiveColumn.value
        style.flexBasis = `${percentage}%`
        style.maxWidth = `${percentage}%`
      }
      return style
    })

    provide(ProListContext, {
      get grid() {
        return props.grid
      },
      get itemLayout() {
        return props.itemLayout
      },
    })

    return () => {
      const sizeCls = props.size === 'large' ? 'lg' : props.size === 'small' ? 'sm' : ''
      const variant = props.variant ?? 'borderless'
      const split = props.split ?? true
      const isSomethingAfterLastItem = !!(props.loadMore || props.pagination || props.footer)
      const renderInternalItem = (item: any, index: number) => {
        if (!props.renderItem)
          return null
        const key = getRowKey(item, index, props.rowKey)
        return <Fragment key={key}>{props.renderItem(item, index, null)}</Fragment>
      }

      let childrenContent: VNodeChild
      if (splitDataSource.value.length > 0) {
        const items = splitDataSource.value.map((item, index) => renderInternalItem(item, index))
        childrenContent = props.grid
          ? (
              <div class={`${prefixCls.value}-grid-container`} style={gridContainerStyle.value}>
                {items.map((child, index) => (
                  <div key={(child as any)?.key ?? index} class={`${prefixCls.value}-grid-col`} style={colStyle.value}>
                    {child}
                  </div>
                ))}
              </div>
            )
          : items
      }
      else if (!slots.default && !props.children) {
        const emptyContent = props.locale?.emptyText
          ?? config.value.renderEmpty?.('List')
          ?? <Empty image={(Empty as any).PRESENTED_IMAGE_SIMPLE} />
        childrenContent = <div class={`${prefixCls.value}-empty-text`}>{emptyContent}</div>
      }
      else {
        childrenContent = slots.default?.() ?? props.children
      }

      const paginationPosition = paginationProps.value.position ?? 'bottom'
      const showPaginationTop = props.pagination && (paginationPosition === 'top' || paginationPosition === 'both')
      const showPaginationBottom = props.pagination && (paginationPosition === 'bottom' || paginationPosition === 'both')
      const triggerPaginationChange = (page: number, pageSize?: number) => {
        const nextPageSize = pageSize ?? 10
        const currentSame = paginationCurrent.value === page && paginationSize.value === nextPageSize
        paginationEventHandled = true
        void Promise.resolve().then(() => {
          paginationEventHandled = false
        })
        paginationCurrent.value = page
        paginationSize.value = nextPageSize
        if (!currentSame) {
          ;(props.pagination as any)?.onChange?.(page, nextPageSize)
        }
      }
      const paginationNode = props.pagination
        ? (
            <div
              class={`${prefixCls.value}-pagination`}
              onClick={(event: MouseEvent) => {
                if (paginationEventHandled)
                  return
                const target = event.target as HTMLElement | null
                const item = target?.closest?.('.ant-pagination-item') as HTMLElement | null
                if (!item || item.classList.contains('ant-pagination-item-active'))
                  return
                const page = Number(item.getAttribute('title') || item.textContent)
                if (Number.isFinite(page) && page > 0)
                  triggerPaginationChange(page, paginationProps.value.pageSize)
              }}
            >
              <Pagination
                align="end"
                {...paginationProps.value as any}
                current={currentPage.value}
                onUpdate:current={(page: number) => {
                  triggerPaginationChange(page, paginationProps.value.pageSize)
                }}
                onUpdate:pageSize={(size: number) => {
                  triggerPaginationChange(currentPage.value, size)
                }}
                onChange={(page: number, pageSize?: number) => {
                  triggerPaginationChange(page, pageSize)
                }}
                onShowSizeChange={(current: number, size: number) => {
                  paginationCurrent.value = current
                  paginationSize.value = size
                  ;(props.pagination as any)?.onShowSizeChange?.(current, size)
                }}
              />
            </div>
          )
        : null

      const classString = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-vertical`]: props.itemLayout === 'vertical',
          [`${prefixCls.value}-${sizeCls}`]: sizeCls,
          [`${prefixCls.value}-split`]: split,
          [`${prefixCls.value}-${variant}`]: variant,
          [`${prefixCls.value}-loading`]: isLoading.value,
          [`${prefixCls.value}-grid`]: !!props.grid,
          [`${prefixCls.value}-something-after-last-item`]: isSomethingAfterLastItem,
        },
        props.hashId,
        hashId,
        props.class,
        props.className,
        props.rootClassName,
      )

      return wrapSSR(
        <div
          {...attrs}
          id={props.id}
          style={props.style}
          class={classString}
          data-testid="pro-list-view"
        >
          <Spin spinning={isLoading.value}>
            {showPaginationTop ? paginationNode : null}
            {props.header ? <div class={`${prefixCls.value}-header`}>{props.header}</div> : null}
            {childrenContent}
            {props.footer ? <div class={`${prefixCls.value}-footer`}>{props.footer}</div> : null}
            {props.loadMore}
            {showPaginationBottom ? paginationNode : null}
          </Spin>
        </div>,
      )
    }
  },
})
