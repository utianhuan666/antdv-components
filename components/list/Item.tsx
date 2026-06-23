import type { CSSProperties, VNodeChild } from 'vue'
import type { CheckCardProps } from '../card'
import type { ListGridType } from './ProListBase'
import { RightOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Skeleton } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { CheckCard } from '../card'
import { useProProviderContext } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import { useRefFunction } from '../utils'
import {
  ProListItem as BaseListItem,
  ProListItemMeta as BaseListItemMeta,
} from './ProListBase'

const BaseListItemComponent = BaseListItem as any

function normalizeEventProps(props?: Record<string, any>) {
  if (!props)
    return undefined

  const normalized = { ...props }
  if (props.onMouseEnter && !normalized.onMouseenter)
    normalized.onMouseenter = props.onMouseEnter
  if (props.onMouseLeave && !normalized.onMouseleave)
    normalized.onMouseleave = props.onMouseLeave
  if (props.onDoubleClick && !normalized.onDblclick)
    normalized.onDblclick = props.onDoubleClick
  return normalized
}

export type GetComponentProps<RecordType> = (
  record: RecordType,
  index: number,
) => Record<string, any>

export interface ListExpandableConfig<RecordType> {
  expandedRowRender?: (
    record: RecordType,
    index: number,
    indent: number,
    expanded: boolean,
  ) => VNodeChild
  expandIcon?:
    | VNodeChild
    | ((props: {
      onExpand: (expanded: boolean) => void
      expanded: boolean
      record: RecordType
    }) => VNodeChild)
  expandRowByClick?: boolean
  indentSize?: number
  expandedRowClassName?:
    | string
    | ((record: RecordType, index: number, indent: number) => string)
  [key: string]: any
}

export interface RenderExpandIconProps<RecordType> {
  prefixCls: string
  expanded: boolean
  expandIcon:
    | VNodeChild
    | ((props: {
      onExpand: (expanded: boolean) => void
      expanded: boolean
      record: RecordType
    }) => VNodeChild)
  onExpand: (expanded: boolean) => void
  record: RecordType
  hashId: string
}

export function renderExpandIcon<RecordType>({
  prefixCls,
  expandIcon = <RightOutlined />,
  onExpand,
  expanded,
  record,
  hashId,
}: RenderExpandIconProps<RecordType>) {
  const expandClassName = `${prefixCls}-row-expand-icon`
  const icon = typeof expandIcon === 'function'
    ? expandIcon({ expanded, onExpand, record })
    : expandIcon

  return (
    <span
      class={clsx(expandClassName, hashId, {
        [`${prefixCls}-row-expanded`]: expanded,
        [`${prefixCls}-row-collapsed`]: !expanded,
      })}
      onClick={(event: MouseEvent) => {
        onExpand(!expanded)
        event.stopPropagation()
      }}
    >
      {icon}
    </span>
  )
}

export interface ItemProps<RecordType> {
  title?: VNodeChild
  subTitle?: VNodeChild
  checkbox?: VNodeChild
  className?: string
  prefixCls?: string
  item?: any
  subheader?: {
    title: VNodeChild
    actions: VNodeChild[]
  }
  index: number
  selected?: boolean
  avatar?: VNodeChild
  content?: VNodeChild
  actions?: VNodeChild[]
  extra?: VNodeChild
  description?: VNodeChild
  loading?: boolean | { spinning?: boolean }
  style?: CSSProperties
  grid?: ListGridType
  expand?: boolean
  rowSupportExpand?: boolean
  onExpand?: (expand: boolean) => void
  expandable?: ListExpandableConfig<RecordType>
  type?: 'new' | 'top' | 'inline' | 'subheader'
  isEditable: boolean
  recordKey: string | number | undefined
  cardProps?: CheckCardProps
  record: RecordType
  onRow?: GetComponentProps<RecordType>
  onItem?: GetComponentProps<RecordType>
  itemHeaderRender?:
    | ((
      item: RecordType,
      index: number,
      defaultDom: VNodeChild | null,
    ) => VNodeChild)
    | false
  itemTitleRender?:
    | ((
      item: RecordType,
      index: number,
      defaultDom: VNodeChild | null,
    ) => VNodeChild)
    | false
}

const ProListItem = defineComponent<ItemProps<any>>({
  name: 'ProListItem',
  inheritAttrs: false,
  props: [
    'title',
    'subTitle',
    'checkbox',
    'className',
    'prefixCls',
    'item',
    'subheader',
    'index',
    'selected',
    'avatar',
    'content',
    'actions',
    'extra',
    'description',
    'loading',
    'style',
    'grid',
    'expand',
    'rowSupportExpand',
    'onExpand',
    'expandable',
    'type',
    'isEditable',
    'recordKey',
    'cardProps',
    'record',
    'onRow',
    'onItem',
    'itemHeaderRender',
    'itemTitleRender',
  ],
  setup(rawProps, { attrs }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-list', computed(() => props.prefixCls))
    const proProvider = useProProviderContext()
    const innerExpanded = ref(!!props.expand)
    const isControlledExpanded = computed(() => props.expand !== undefined)
    const expanded = computed(() =>
      isControlledExpanded.value ? !!props.expand : innerExpanded.value,
    )

    const onExpand = useRefFunction(
      (updater: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof updater === 'function'
          ? (updater as (prev: boolean) => boolean)(expanded.value)
          : updater

        if (!isControlledExpanded.value)
          innerExpanded.value = next

        props.onExpand?.(next)
      },
    )

    return () => {
      const defaultClassName = `${prefixCls.value}-row`
      const {
        title,
        subTitle,
        content,
        itemTitleRender,
        actions,
        avatar,
        cardProps,
        description,
        isEditable,
        checkbox,
        index,
        selected,
        loading: rawLoading,
        expandable: expandableConfig,
        rowSupportExpand,
        type,
        style,
        record,
        onRow,
        onItem,
        itemHeaderRender,
        extra,
      } = props

      const {
        expandedRowRender,
        expandIcon,
        expandRowByClick,
        indentSize = 8,
        expandedRowClassName,
      } = expandableConfig || {}
      const loading = typeof rawLoading === 'boolean'
        ? rawLoading
        : !!rawLoading?.spinning

      const propsClassName = props.className ?? defaultClassName
      const hashId = proProvider.hashId || ''
      const className = clsx(
        {
          [`${defaultClassName}-selected`]: !cardProps && selected,
          [`${defaultClassName}-type-${type}`]: !!type,
          [`${defaultClassName}-editable`]: isEditable,
        },
        hashId,
        defaultClassName,
      )

      const hasExpandBehavior = expandableConfig != null
        && Object.keys(expandableConfig).length > 0
      const needExpanded = expanded.value || !hasExpandBehavior
      const expandedRowDom = expandedRowRender?.(
        record,
        index,
        indentSize,
        expanded.value,
      )
      const actionsArray = actions
        ? (Array.isArray(actions) ? actions : [actions])
        : undefined

      const titleDom = title || subTitle
        ? (
            <div class={clsx(`${defaultClassName}-header-container`, hashId)}>
              {title
                ? (
                    <div
                      class={clsx(`${defaultClassName}-title`, hashId, {
                        [`${defaultClassName}-title-editable`]: isEditable,
                      })}
                    >
                      {title}
                    </div>
                  )
                : null}
              {subTitle
                ? (
                    <div
                      class={clsx(`${defaultClassName}-sub-title`, hashId, {
                        [`${defaultClassName}-sub-title-editable`]: isEditable,
                      })}
                    >
                      {subTitle}
                    </div>
                  )
                : null}
            </div>
          )
        : null

      const itemTitleRenderResult = typeof itemTitleRender === 'function'
        ? itemTitleRender(record, index, titleDom)
        : itemTitleRender
      const metaTitle = itemTitleRenderResult ?? titleDom
      const metaDom = metaTitle || avatar || subTitle || description
        ? (
            <BaseListItemMeta
              avatar={avatar}
              title={metaTitle}
              description={
                description && needExpanded
                  ? (
                      <div class={clsx(`${defaultClassName}-description`, hashId)}>
                        {description}
                      </div>
                    )
                  : null
              }
            />
          )
        : null

      const rawRowProps = onRow?.(record, index)
      const rawItemProps = onItem?.(record, index)
      const rowProps = normalizeEventProps(rawRowProps)
      const itemProps = normalizeEventProps(rawItemProps)
      const expandedRowClassStr = typeof expandedRowClassName === 'function'
        ? expandedRowClassName(record, index, indentSize)
        : expandedRowClassName
      const headerDom = typeof itemHeaderRender === 'function'
        ? itemHeaderRender(record, index, metaDom)
        : metaDom

      if (cardProps) {
        const cardPropsWithEvents = cardProps as CheckCardProps & {
          onClick?: (event: MouseEvent) => void
        }
        const cardTitleDom = avatar || title
          ? (
              <>
                {avatar}
                <span class={clsx(`${prefixCls.value}-item-meta-title`, hashId)}>
                  {title}
                </span>
              </>
            )
          : null

        return (
          <div
            class={clsx(hashId, `${className}-card-container`, {
              [propsClassName]: propsClassName !== defaultClassName,
            })}
            style={style}
          >
            <CheckCard
              bordered
              style={{ width: '100%' }}
              className={clsx(`${defaultClassName}-card`, hashId)}
              {...(cardProps as any)}
              title={cardTitleDom}
              subTitle={subTitle}
              extra={actionsArray}
              bodyStyle={{ padding: proProvider.token.paddingLG, ...cardProps.bodyStyle }}
              {...(itemProps as any)}
              onClick={(event: MouseEvent) => {
                cardPropsWithEvents.onClick?.(event)
                rawItemProps?.onClick?.(event)
              }}
            >
              <Skeleton avatar title={false} loading={loading} active>
                <div class={clsx(`${className}-header`, hashId)}>
                  {typeof itemTitleRender === 'function'
                    ? itemTitleRender(record, index, titleDom)
                    : null}
                  {content}
                </div>
              </Skeleton>
            </CheckCard>
          </div>
        )
      }

      const rowClassName = clsx(hashId, {
        [`${defaultClassName}-item-has-checkbox`]: checkbox,
        [`${defaultClassName}-item-has-avatar`]: avatar,
        [className]: className,
      })

      return (
        <BaseListItemComponent
          className={clsx(rowClassName, hashId, {
            [propsClassName]: propsClassName !== defaultClassName,
          })}
          {...attrs}
          actions={actionsArray}
          extra={extra}
          {...rowProps}
          {...itemProps}
          onClick={(event: MouseEvent) => {
            rawRowProps?.onClick?.(event)
            rawItemProps?.onClick?.(event)
            if (expandRowByClick)
              onExpand(!expanded.value)
          }}
        >
          <Skeleton avatar title={false} loading={loading} active>
            <div class={clsx(`${className}-header`, hashId)}>
              <div class={clsx(`${className}-header-option`, hashId)}>
                {checkbox
                  ? (
                      <div class={clsx(`${className}-checkbox`, hashId)}>
                        {checkbox}
                      </div>
                    )
                  : null}
                {hasExpandBehavior && rowSupportExpand
                  ? renderExpandIcon({
                      prefixCls: prefixCls.value,
                      hashId,
                      expandIcon,
                      onExpand,
                      expanded: expanded.value,
                      record,
                    } as RenderExpandIconProps<any>)
                  : null}
              </div>
              {headerDom}
            </div>
            {needExpanded && (content || expandedRowDom)
              ? (
                  <div class={clsx(`${className}-content`, hashId)}>
                    {[
                      content,
                      ...(expandedRowRender && rowSupportExpand
                        ? [<div class={expandedRowClassStr}>{expandedRowDom}</div>]
                        : []),
                    ]}
                  </div>
                )
              : null}
          </Skeleton>
        </BaseListItemComponent>
      )
    }
  },
})

export default ProListItem
