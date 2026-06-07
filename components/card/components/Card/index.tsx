import type { CSSProperties, VNode } from 'vue'
import type { Breakpoint, CardProps, ColSpanType, Gutter, ProCardTabItem } from '../../typing'
import { RightOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Tabs, useBreakpoint } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, ref } from 'vue'
import LabelIconTip from '../../../utils/components/LabelIconTip'
import Actions from '../Actions'
import Loading from '../Loading'
import useStyle from './style'

const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']

function hasOwn(target: object, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function getResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>> | undefined,
  screens: Partial<Record<Breakpoint, boolean>> | undefined,
): T | undefined {
  if (value && typeof value === 'object') {
    const key = responsiveArray.find(name => screens?.[name] && (value as Partial<Record<Breakpoint, T>>)[name] != null)
    return key ? (value as Partial<Record<Breakpoint, T>>)[key] : undefined
  }
  return value as T | undefined
}

function normalizeGutter(
  gutter: Gutter | Gutter[] | undefined,
  screens: Partial<Record<Breakpoint, boolean>> | undefined,
): [number, number] {
  const normalized = Array.isArray(gutter) ? gutter : [gutter || 0, 0]
  return normalized.map((value) => {
    if (typeof value === 'number')
      return value
    return getResponsiveValue(value, screens) ?? 0
  }) as [number, number]
}

function normalizeColSpan(
  colSpan: CardProps['colSpan'],
  screens: Partial<Record<Breakpoint, boolean>> | undefined,
) {
  const span = getResponsiveValue<ColSpanType>(colSpan as any, screens)
  const isFixedWidth = typeof span === 'string' && /\d%|\dpx/i.test(span)
  return {
    span,
    colSpanStyle: isFixedWidth
      ? { width: span as string, flexShrink: 0 } as CSSProperties
      : undefined,
  }
}

function isProCardVNode(node: VNode) {
  return !!((node.type as any)?.isProCard)
}

function normalizeTabItems(items?: ProCardTabItem[]) {
  return items?.map(item => ({
    ...item,
    content: item.content ?? item.children,
  }))
}

const Card = defineComponent({
  name: 'ProCard',
  inheritAttrs: false,
  props: [
    'class',
    'className',
    'rootClassName',
    'style',
    'styles',
    'title',
    'subTitle',
    'extra',
    'wrap',
    'layout',
    'loading',
    'gutter',
    'tooltip',
    'split',
    'headerBordered',
    'variant',
    'cover',
    'classNames',
    'boxShadow',
    'size',
    'actions',
    'ghost',
    'hoverable',
    'direction',
    'collapsed',
    'collapsible',
    'collapsibleIconRender',
    'colSpan',
    'colStyle',
    'defaultCollapsed',
    'checked',
    'tabs',
    'type',
    'prefixCls',
  ],
  emits: ['collapse', 'click', 'checked'],
  setup(rawProps, { attrs, emit, slots }) {
    const props = rawProps as CardProps
    const config = useConfig()
    const screens = useBreakpoint()
    const prefixCls = computed(() => props.prefixCls || config.value.getPrefixCls('pro-card'))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const innerCollapsed = ref(!!props.defaultCollapsed)

    const controlledCollapsed = computed(() => hasOwn(rawProps, 'collapsed') && props.collapsed !== undefined)
    const mergedCollapsed = computed(() => controlledCollapsed.value ? !!props.collapsed : innerCollapsed.value)

    const setCollapsed = (value: boolean) => {
      if (!controlledCollapsed.value)
        innerCollapsed.value = value
      emit('collapse', value)
    }

    const handleCollapsibleIconClick = (event: MouseEvent) => {
      if (props.collapsible !== 'icon')
        return
      event.stopPropagation()
      setCollapsed(!mergedCollapsed.value)
    }

    const renderCollapsibleButton = () => {
      if (!props.collapsible)
        return null

      return (
        <span
          role="button"
          tabindex={props.collapsible === 'icon' ? 0 : undefined}
          class={`${prefixCls.value}-collapsible-icon`}
          onClick={handleCollapsibleIconClick}
          onKeydown={(event: KeyboardEvent) => {
            if (props.collapsible === 'icon' && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              setCollapsed(!mergedCollapsed.value)
            }
          }}
        >
          {props.collapsibleIconRender
            ? props.collapsibleIconRender({ collapsed: mergedCollapsed.value })
            : <RightOutlined rotate={!mergedCollapsed.value ? 90 : undefined} />}
        </span>
      )
    }

    const renderChildren = () => {
      const children = slots.default?.() || []
      let containProCard = false
      const currentScreens = (screens.value ?? undefined) as Partial<Record<Breakpoint, boolean>> | undefined
      const [horizontalGutter, verticalGutter] = normalizeGutter(props.gutter, currentScreens)

      const nodes = children.map((node, index) => {
        if (!isProCardVNode(node))
          return node

        containProCard = true
        const childProps = (node.props || {}) as CardProps
        const { span, colSpanStyle } = normalizeColSpan(childProps.colSpan, currentScreens)
        const columnClassName = clsx(`${prefixCls.value}-col`, hashId, {
          [`${prefixCls.value}-split-vertical`]: props.split === 'vertical' && index !== children.length - 1,
          [`${prefixCls.value}-split-horizontal`]: props.split === 'horizontal' && index !== children.length - 1,
          [`${prefixCls.value}-col-${span}`]: typeof span === 'number' && span >= 0 && span <= 24,
        })

        return (
          <div
            key={`pro-card-col-${String(node.key ?? index)}`}
            class={columnClassName}
            style={{
              ...colSpanStyle,
              ...(horizontalGutter > 0
                ? {
                    paddingInlineEnd: horizontalGutter / 2,
                    paddingInlineStart: horizontalGutter / 2,
                  }
                : {}),
              ...(verticalGutter > 0
                ? {
                    paddingBlockStart: verticalGutter / 2,
                    paddingBlockEnd: verticalGutter / 2,
                  }
                : {}),
              ...props.colStyle,
            }}
          >
            {node}
          </div>
        )
      })

      return { containProCard, nodes }
    }

    return () => {
      const childrenResult = renderChildren()
      const collapsed = mergedCollapsed.value
      const variant = props.variant ?? 'outlined'
      const styles = props.styles || {}
      const classNames = props.classNames || {}
      const title = slots.title?.() ?? props.title
      const extra = slots.extra?.() ?? props.extra
      const cover = slots.cover?.() ?? props.cover
      const actions = slots.actions?.() ?? props.actions
      const collapsibleButton = renderCollapsibleButton()
      const bodyStylePadding = styles.body?.padding
      const loadingDom = typeof props.loading === 'boolean'
        ? (
            <Loading
              prefix={prefixCls.value}
              padding={bodyStylePadding === 0 || bodyStylePadding === '0px' ? 24 : undefined}
            />
          )
        : props.loading

      const cardCls = clsx(
        prefixCls.value,
        hashId,
        props.class,
        props.className,
        props.rootClassName,
        classNames.root,
        {
          [`${prefixCls.value}-border`]: variant === 'outlined',
          [`${prefixCls.value}-box-shadow`]: props.boxShadow,
          [`${prefixCls.value}-contain-card`]: childrenResult.containProCard,
          [`${prefixCls.value}-loading`]: props.loading,
          [`${prefixCls.value}-split`]: props.split === 'vertical' || props.split === 'horizontal',
          [`${prefixCls.value}-ghost`]: props.ghost,
          [`${prefixCls.value}-hoverable`]: props.hoverable,
          [`${prefixCls.value}-size-${props.size}`]: props.size,
          [`${prefixCls.value}-type-${props.type}`]: props.type,
          [`${prefixCls.value}-collapse`]: collapsed,
          [`${prefixCls.value}-checked`]: props.checked,
        },
      )

      const bodyCls = clsx(`${prefixCls.value}-body`, hashId, classNames.body, {
        [`${prefixCls.value}-body-center`]: props.layout === 'center',
        [`${prefixCls.value}-body-direction-column`]: props.split === 'horizontal' || props.direction === 'column',
        [`${prefixCls.value}-body-wrap`]: props.wrap && childrenResult.containProCard,
      })

      const headerCls = clsx(`${prefixCls.value}-header`, hashId, classNames.header, {
        [`${prefixCls.value}-header-border`]: props.headerBordered || props.type === 'inner',
        [`${prefixCls.value}-header-collapsible`]: collapsibleButton,
      })

      const header = (title || extra || collapsibleButton)
        ? (
            <div
              class={headerCls}
              style={styles.header}
              onClick={() => {
                if (props.collapsible === 'header' || props.collapsible === true)
                  setCollapsed(!collapsed)
              }}
            >
              <div class={clsx(`${prefixCls.value}-title`, hashId, classNames.title)} style={styles.title}>
                {collapsibleButton}
                <LabelIconTip label={title} tooltip={props.tooltip} subTitle={props.subTitle} />
              </div>
              {extra
                ? (
                    <div
                      class={clsx(`${prefixCls.value}-extra`, hashId, classNames.extra)}
                      style={styles.extra}
                      onClick={(event: MouseEvent) => event.stopPropagation()}
                    >
                      {extra}
                    </div>
                  )
                : null}
            </div>
          )
        : null

      const tabs = props.tabs
      const tabDom = tabs
        ? (
            <div class={clsx(`${prefixCls.value}-tabs`, hashId)}>
              {props.loading
                ? loadingDom
                : (
                    <Tabs
                      {...Object.fromEntries(Object.entries(tabs).filter(([key]) => key !== 'cardProps' && key !== 'onChange'))}
                      items={normalizeTabItems(tabs.items) as any}
                      onChange={(key: string) => tabs.onChange?.(key)}
                    />
                  )}
            </div>
          )
        : null

      return wrapSSR(
        <div
          {...attrs}
          class={cardCls}
          style={[styles.root, props.style] as any}
          onClick={(event: MouseEvent) => {
            emit('checked', event)
            emit('click', event)
          }}
        >
          {header}
          {cover && !collapsed
            ? <div class={clsx(`${prefixCls.value}-cover`, hashId, classNames.cover)} style={styles.cover}>{cover}</div>
            : null}
          {tabDom ?? (
            <div class={bodyCls} style={styles.body}>
              {props.loading ? loadingDom : childrenResult.nodes}
            </div>
          )}
          {actions ? <Actions actions={actions} prefixCls={prefixCls.value} className={classNames.actions} style={styles.actions} /> : null}
        </div>,
      )
    }
  },
})

export default Card
