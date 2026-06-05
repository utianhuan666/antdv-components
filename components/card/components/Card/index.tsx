import type { CSSProperties, VNode } from 'vue'
import type { Breakpoint, CardProps, ColSpanType, Gutter, ProCardTabItem } from '../../typing'
import { RightOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Tabs } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import LabelIconTip from '../../../utils/components/LabelIconTip'
import Actions from '../Actions'
import Loading from '../Loading'
import useStyle from './style'

const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']

function hasOwn(target: object, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function normalizeGutter(gutter: Gutter | Gutter[] | undefined): [number, number] {
  const normalized = Array.isArray(gutter) ? gutter : [gutter || 0, 0]
  return normalized.map((value) => {
    if (typeof value === 'number')
      return value
    if (value && typeof value === 'object') {
      const key = responsiveArray.find(name => value[name] != null)
      return key ? (value[key] as number) : 0
    }
    return 0
  }) as [number, number]
}

function normalizeColSpan(colSpan: CardProps['colSpan']) {
  let span: ColSpanType | undefined = colSpan as ColSpanType | undefined
  if (colSpan && typeof colSpan === 'object') {
    const key = responsiveArray.find(name => colSpan[name] != null)
    span = key ? colSpan[key] : undefined
  }

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
    const { wrapSSR, hashId } = useStyle(props.prefixCls || 'ant-pro-card')
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
          class="ant-pro-card-collapsible-icon"
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
      const [horizontalGutter, verticalGutter] = normalizeGutter(props.gutter)

      const nodes = children.map((node, index) => {
        if (!isProCardVNode(node))
          return node

        containProCard = true
        const childProps = (node.props || {}) as CardProps
        const { span, colSpanStyle } = normalizeColSpan(childProps.colSpan)
        const columnClassName = clsx('ant-pro-card-col', {
          'ant-pro-card-split-vertical': props.split === 'vertical' && index !== children.length - 1,
          'ant-pro-card-split-horizontal': props.split === 'horizontal' && index !== children.length - 1,
          [`ant-pro-card-col-${span}`]: typeof span === 'number' && span >= 0 && span <= 24,
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
      const loadingDom = typeof props.loading === 'boolean'
        ? <Loading prefix="ant-pro-card" />
        : props.loading

      const cardCls = clsx(
        'ant-pro-card',
        hashId,
        props.class,
        props.className,
        props.rootClassName,
        classNames.root,
        {
          'ant-pro-card-border': variant === 'outlined',
          'ant-pro-card-box-shadow': props.boxShadow,
          'ant-pro-card-contain-card': childrenResult.containProCard,
          'ant-pro-card-loading': props.loading,
          'ant-pro-card-split': props.split === 'vertical' || props.split === 'horizontal',
          'ant-pro-card-ghost': props.ghost,
          'ant-pro-card-hoverable': props.hoverable,
          [`ant-pro-card-size-${props.size}`]: props.size,
          [`ant-pro-card-type-${props.type}`]: props.type,
          'ant-pro-card-collapse': collapsed,
          'ant-pro-card-checked': props.checked,
        },
      )

      const bodyCls = clsx('ant-pro-card-body', classNames.body, {
        'ant-pro-card-body-center': props.layout === 'center',
        'ant-pro-card-body-direction-column': props.split === 'horizontal' || props.direction === 'column',
        'ant-pro-card-body-wrap': props.wrap && childrenResult.containProCard,
      })

      const headerCls = clsx('ant-pro-card-header', classNames.header, {
        'ant-pro-card-header-border': props.headerBordered || props.type === 'inner',
        'ant-pro-card-header-collapsible': collapsibleButton,
      })

      const header = (title != null || extra != null || collapsibleButton)
        ? (
            <div
              class={headerCls}
              style={styles.header}
              onClick={() => {
                if (props.collapsible === 'header' || props.collapsible === true)
                  setCollapsed(!collapsed)
              }}
            >
              <div class={clsx('ant-pro-card-title', classNames.title)} style={styles.title}>
                {collapsibleButton}
                <LabelIconTip label={title} tooltip={props.tooltip} subTitle={props.subTitle} />
              </div>
              {extra != null
                ? (
                    <div
                      class={clsx('ant-pro-card-extra', classNames.extra)}
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
            <div class="ant-pro-card-tabs">
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
          style={{ ...styles.root, ...props.style }}
          onClick={(event: MouseEvent) => {
            emit('checked', event)
            emit('click', event)
          }}
        >
          {header}
          {cover != null && !collapsed
            ? <div class={clsx('ant-pro-card-cover', classNames.cover)} style={styles.cover}>{cover}</div>
            : null}
          {tabDom ?? (
            <div class={bodyCls} style={styles.body}>
              {props.loading ? loadingDom : childrenResult.nodes}
            </div>
          )}
          {actions ? <Actions actions={actions} prefixCls="ant-pro-card" /> : null}
        </div>,
      )
    }
  },
})

export default Card
