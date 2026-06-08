import type { ComputedRef, CSSProperties, VNode } from 'vue'
import type { Breakpoint, CardProps, ColSpanType, Gutter } from '../../typing'
import { RightOutlined } from '@antdv-next/icons'
import { clsx, omit, useMergedState } from '@v-c/util'
import { Tabs, useBreakpoint } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, isVNode } from 'vue'
import { proTheme } from '../../../provider'
import { LabelIconTip, useRefFunction } from '../../../utils'
import Actions from '../Actions'
import Loading from '../Loading'
import useStyle from './style'

// 子卡片元素类型：Vue VNode，其组件类型上可能带 isProCard 标记。
// 对应 React 的 ProCardChildType（React.ReactElement<CardProps, ... & { isProCard?: boolean }>）。
type ProCardChildType = VNode

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
    const screensRef = useBreakpoint()
    // 用于 loading 占位 padding 兜底（body padding 被显式置 0 时使用 token.paddingLG）
    const themeToken = proTheme.useToken()
    const prefixCls = computed(() => config.value.getPrefixCls('pro-card'))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    // 对应 React useControlledState<boolean>(defaultCollapsed, controlCollapsed)
    const [collapsed, setCollapsedInner] = useMergedState<boolean>(props.defaultCollapsed ?? false, {
      value: computed(() => props.collapsed) as ComputedRef<boolean>,
    })

    /**
     * 使用 useRefFunction 包装回调，确保引用稳定
     */
    const onCollapseCallback = useRefFunction((c: boolean) => {
      emit('collapse', c)
    })

    /**
     * 使用 queueMicrotask 延迟回调调用，避免在渲染阶段调用外部回调导致的 React 警告
     * "Cannot update a component while rendering a different component"
     */
    const setCollapsed = (updater: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof updater === 'function' ? updater(collapsed.value) : updater
      setCollapsedInner(next)
      queueMicrotask(() => {
        onCollapseCallback(next)
      })
    }

    return () => {
      const {
        className,
        rootClassName,
        style,
        styles,
        wrap = false,
        layout,
        loading,
        gutter = 0,
        tooltip,
        split,
        headerBordered = false,
        variant: customVariant,
        classNames,
        boxShadow = false,
        size,
        ghost = false,
        hoverable = false,
        direction,
        collapsible = false,
        collapsibleIconRender,
        colStyle,
        checked,
        tabs,
        type,
      } = props

      const title = slots.title?.() ?? props.title
      const subTitle = slots.subTitle?.() ?? props.subTitle
      const extra = slots.extra?.() ?? props.extra
      const cover = slots.cover?.() ?? props.cover
      const actions = slots.actions?.() ?? props.actions

      const variant = customVariant ?? 'outlined'

      const mergedStyles = {
        header: styles?.header,
        body: styles?.body,
        root: styles?.root,
        extra: styles?.extra,
        title: styles?.title,
        actions: styles?.actions,
        cover: styles?.cover,
      }

      const token = themeToken.token.value

      const screens = screensRef.value || {
        lg: true,
        md: true,
        sm: true,
        xl: false,
        xs: false,
        xxl: false,
      }

      // 顺序决定如何进行响应式取值，按最大响应值依次取值，请勿修改。
      const responsiveArray: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
      // 直接使用 tabs.items，不再支持旧的 TabPane 写法。
      // antdv-next Tabs 的 item 用 content 字段承载内容（React antd 用 children），此处做键名转换。
      const ModifyTabItemsContent = tabs?.items?.map(item => ({
        ...item,
        content: item.content ?? item.children,
      }))
      const tabsRestProps: Record<string, any> = tabs ? omit(tabs as Record<string, any>, ['cardProps']) : {}

      /**
       * 根据响应式获取 gutter, 参考 antd 实现
       *
       * @param gutter Gutter
       */
      const getNormalizedGutter = (gut: Gutter | Gutter[]) => {
        const results: [number, number] = [0, 0]
        const normalizedGutter = Array.isArray(gut) ? gut : [gut, 0]
        normalizedGutter.forEach((g, index) => {
          if (typeof g === 'object') {
            for (let i = 0; i < responsiveArray.length; i += 1) {
              const breakpoint: Breakpoint = responsiveArray[i]!
              if (screens[breakpoint] && (g as Partial<Record<Breakpoint, number>>)[breakpoint] !== undefined) {
                results[index] = (g as Partial<Record<Breakpoint, number>>)[breakpoint] as number
                break
              }
            }
          }
          else {
            results[index] = (g as number) || 0
          }
        })
        return results
      }

      const getColSpanStyle = (colSpan: CardProps['colSpan']) => {
        let span = colSpan

        // colSpan 响应式
        if (typeof colSpan === 'object') {
          for (let i = 0; i < responsiveArray.length; i += 1) {
            const breakpoint: Breakpoint = responsiveArray[i]!
            if (screens?.[breakpoint] && (colSpan as Partial<Record<Breakpoint, ColSpanType>>)?.[breakpoint] !== undefined) {
              span = (colSpan as Partial<Record<Breakpoint, ColSpanType>>)[breakpoint]
              break
            }
          }
        }

        // 当 colSpan 为 30% 或 300px 时
        const isPercentOrPxWidth = typeof span === 'string' && /\d%|\dpx/i.test(span)
        const colSpanStyle: CSSProperties = isPercentOrPxWidth
          ? { width: span as string, flexShrink: 0 }
          : {}

        return { span, colSpanStyle }
      }

      const [horizontalGutter, verticalGutter] = getNormalizedGutter(gutter)

      // 判断是否套了卡片，如果套了的话将自身卡片内部内容的 padding 设置为0
      let containProCard = false
      const childrenArray = (slots.default?.() || []) as ProCardChildType[]

      const childrenModified = childrenArray.map((element, index) => {
        if ((element.type as any)?.isProCard) {
          containProCard = true

          // 宽度
          const { colSpan } = (element.props || {}) as CardProps
          const { span, colSpanStyle } = getColSpanStyle(colSpan)

          const columnClassName = clsx(`${prefixCls.value}-col`, hashId, {
            [`${prefixCls.value}-split-vertical`]:
              split === 'vertical' && index !== childrenArray.length - 1,
            [`${prefixCls.value}-split-horizontal`]:
              split === 'horizontal' && index !== childrenArray.length - 1,
            [`${prefixCls.value}-col-${span}`]:
              typeof span === 'number' && span >= 0 && span <= 24,
          })

          return wrapSSR(
            <div
              key={`pro-card-col-${(element.key as any) || index}`}
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
                ...colStyle,
              }}
              class={columnClassName}
            >
              {element}
            </div>,
          )
        }
        return element
      })

      const cardCls = clsx(
        prefixCls.value,
        props.class,
        className,
        rootClassName,
        hashId,
        classNames?.root,
        {
          [`${prefixCls.value}-border`]: variant === 'outlined',
          [`${prefixCls.value}-box-shadow`]: boxShadow,
          [`${prefixCls.value}-contain-card`]: containProCard,
          [`${prefixCls.value}-loading`]: loading,
          [`${prefixCls.value}-split`]: split === 'vertical' || split === 'horizontal',
          [`${prefixCls.value}-ghost`]: ghost,
          [`${prefixCls.value}-hoverable`]: hoverable,
          [`${prefixCls.value}-size-${size}`]: size,
          [`${prefixCls.value}-type-${type}`]: type,
          [`${prefixCls.value}-collapse`]: collapsed.value,
          [`${prefixCls.value}-checked`]: checked,
        },
      )

      const bodyCls = clsx(`${prefixCls.value}-body`, hashId, classNames?.body, {
        [`${prefixCls.value}-body-center`]: layout === 'center',
        [`${prefixCls.value}-body-direction-column`]:
          split === 'horizontal' || direction === 'column',
        [`${prefixCls.value}-body-wrap`]: wrap && containProCard,
      })

      const bodyStylePadding = mergedStyles.body?.padding

      // body padding 被显式置 0 时，loading 占位需要补回默认 padding，
      // 否则骨架屏会贴到边缘。这里对齐 body 的默认 padding（token.paddingLG）。
      const loadingDOM = isVNode(loading)
        ? loading
        : (
            <Loading
              prefix={prefixCls.value}
              style={
                bodyStylePadding === 0 || bodyStylePadding === '0px'
                  ? { padding: `${token.paddingLG}px` }
                  : undefined
              }
            />
          )

      const handleCollapsibleIconClick = () => {
        if (collapsible === 'icon')
          setCollapsed((prev: boolean) => !prev)
      }

      const collapsibleButton = collapsible && (
        <span
          role="button"
          tabindex={collapsible === 'icon' ? 0 : undefined}
          class={clsx(`${prefixCls.value}-collapsible-icon`, hashId)}
          onClick={collapsible === 'icon' ? handleCollapsibleIconClick : undefined}
          onKeydown={
            collapsible === 'icon'
              ? (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCollapsibleIconClick()
                  }
                }
              : undefined
          }
        >
          {collapsibleIconRender
            ? collapsibleIconRender({ collapsed: collapsed.value })
            : <RightOutlined rotate={!collapsed.value ? 90 : undefined} />}
        </span>
      )

      const headerCls = clsx(`${prefixCls.value}-header`, hashId, classNames?.header, {
        [`${prefixCls.value}-header-border`]: headerBordered || type === 'inner',
        [`${prefixCls.value}-header-collapsible`]: collapsibleButton,
      })

      const titleCls = clsx(`${prefixCls.value}-title`, hashId, classNames?.title)
      const extraCls = clsx(`${prefixCls.value}-extra`, hashId, classNames?.extra)

      const rootStyle = { ...mergedStyles.root, ...(style as CSSProperties) }

      return wrapSSR(
        <div
          {...attrs}
          class={cardCls}
          style={rootStyle}
          onClick={(e: MouseEvent) => {
            emit('checked', e)
            emit('click', e)
          }}
        >
          {(title || extra || collapsibleButton) && (
            <div
              class={headerCls}
              style={mergedStyles.header}
              onClick={() => {
                if (collapsible === 'header' || collapsible === true)
                  setCollapsed(!collapsed.value)
              }}
            >
              <div class={titleCls} style={mergedStyles.title}>
                {collapsibleButton}
                <LabelIconTip label={title} tooltip={tooltip} subTitle={subTitle} />
              </div>
              {extra && (
                <div
                  class={extraCls}
                  style={mergedStyles.extra}
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                >
                  {extra}
                </div>
              )}
            </div>
          )}
          {cover && !collapsed.value && (
            <div
              class={clsx(`${prefixCls.value}-cover`, hashId, classNames?.cover)}
              style={mergedStyles.cover}
            >
              {cover}
            </div>
          )}
          {tabs
            ? (
                // antdv-next Tabs 仅通过 items 渲染，传 children 会被忽略。
                // loading 状态下，把骨架屏放到 Tabs 容器外层，避免 children 被吞。
                <div class={clsx(`${prefixCls.value}-tabs`, hashId)}>
                  {loading
                    ? loadingDOM
                    : (
                        <Tabs
                          onChange={tabs.onChange as any}
                          {...tabsRestProps}
                          items={ModifyTabItemsContent as any}
                        />
                      )}
                </div>
              )
            : (
                <div class={bodyCls} style={mergedStyles.body}>
                  {loading ? loadingDOM : childrenModified}
                </div>
              )}
          {actions ? <Actions actions={actions} prefixCls={prefixCls.value} /> : null}
        </div>,
      )
    }
  },
})

export default Card
