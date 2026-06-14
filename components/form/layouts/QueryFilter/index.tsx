import type { ColProps, FormItemProps, FormProps, RowProps } from 'antdv-next'
import type { ComputedRef, CSSProperties, VNodeChild } from 'vue'
import type { CommonFormProps, ProFormInstance } from '../../BaseForm'
import type { ActionsProps } from './Actions'
import { clsx, useMergedState } from '@v-c/util'
import { Col, FormItem, Row, theme } from 'antdv-next'
import { computed, defineComponent, isVNode, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useRefFunction } from '../../../utils'
import BaseForm from '../../BaseForm'
import { cloneElement, flattenChildren, getVNodeProps } from '../_shared/vueHelpers'
import Actions from './Actions'
import { calcSubmitterOffset, processQueryFilterItems } from './processQueryFilterItems'
import { useStyle } from './style'

interface BreakpointsConfig {
  breakpoints: {
    vertical: (string | number)[][]
    default: (string | number)[][]
  }
  configSpanBreakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
}

function getBreakpointsConfig(token: {
  screenSMMin?: number
  screenMDMin?: number
  screenLGMin?: number
  screenXLMin?: number
  screenXXLMin?: number
}): BreakpointsConfig {
  const defaultToken = theme.getDesignToken()
  const t = { ...defaultToken, ...token }
  const bp = {
    xs: t.screenSMMin ?? 576,
    sm: t.screenMDMin ?? 768,
    md: t.screenLGMin ?? 992,
    lg: t.screenXLMin ?? 1200,
    xl: t.screenXXLMin ?? 1600,
    xxl: Infinity,
  } as const

  return {
    configSpanBreakpoints: bp,
    breakpoints: {
      vertical: [
        [bp.xs, 1, 'vertical'],
        [bp.md, 2, 'vertical'],
        [bp.xl, 3, 'vertical'],
        [Infinity, 4, 'vertical'],
      ],
      default: [
        [bp.xs, 1, 'vertical'],
        [bp.sm, 2, 'vertical'],
        [bp.xl, 3, 'horizontal'],
        [Infinity, 4, 'horizontal'],
      ],
    },
  }
}

function getSpanConfig(
  layout: FormProps['layout'],
  width: number,
  span: SpanConfig | undefined,
  breakpointsConfig: BreakpointsConfig,
) {
  if (typeof span === 'number')
    return { span, layout }
  const { breakpoints, configSpanBreakpoints } = breakpointsConfig
  if (span) {
    const config = (['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map(key => [
      configSpanBreakpoints[key],
      24 / span[key],
      'horizontal',
    ])
    const found = config.find(([point]) => width < (point as number) + 16)
    return { span: (found?.[1] || 8) as number, layout: 'horizontal' as FormProps['layout'] }
  }
  const spanConfig = breakpoints[(layout as 'default') || 'default']
  const breakPoint = (spanConfig || breakpoints.default).find(item => width < (item[0] as number) + 16)

  if (!breakPoint)
    return { span: 8, layout: 'horizontal' as FormProps['layout'] }

  return {
    span: 24 / (breakPoint[1] as number),
    layout: breakPoint[2] as FormProps['layout'],
  }
}

export type SpanConfig = number | {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

type SubmitterColSpanProps = Omit<ColProps, 'span'> & {
  span: number
  style?: CSSProperties
}

export type BaseQueryFilterProps = Omit<
  ActionsProps,
  'submitter' | 'setCollapsed' | 'isForm'
> & {
  className?: string
  defaultCollapsed?: boolean
  layout?: FormProps['layout']
  defaultColsNumber?: number
  defaultFormItemsNumber?: number
  labelWidth?: number | 'auto'
  split?: boolean
  span?: SpanConfig
  searchText?: string
  resetText?: string
  searchGutter?: RowProps['gutter']
  optionRender?:
    | ((
      searchConfig: Omit<BaseQueryFilterProps, 'submitter' | 'isForm'>,
      props: Omit<BaseQueryFilterProps, 'searchConfig'>,
      dom: VNodeChild[],
    ) => VNodeChild[])
    | false
  ignoreRules?: boolean
  showHiddenNum?: boolean
  submitterColSpanProps?: SubmitterColSpanProps
  containerStyle?: CSSProperties
}

export type QueryFilterProps<T = Record<string, any>, U = Record<string, any>>
  = Omit<FormProps, 'onFinish'> & CommonFormProps<T, U> & BaseQueryFilterProps & {
    onReset?: (values: T) => void
  }

interface QueryFilterContentProps {
  defaultCollapsed: boolean
  onCollapse?: (collapsed: boolean) => void
  collapsed?: boolean
  resetText?: string
  searchText?: string
  searchGutter?: RowProps['gutter']
  split?: boolean
  form: ProFormInstance<any>
  items: VNodeChild[]
  submitter?: VNodeChild | false
  showLength: number
  collapseRender: QueryFilterProps<any>['collapseRender']
  spanSize: {
    span: number
    layout: FormProps['layout']
  }
  submitterColSpanProps?: SubmitterColSpanProps
  baseClassName: string
  hashId?: string
  optionRender: BaseQueryFilterProps['optionRender']
  ignoreRules?: boolean
  preserve?: boolean
  showHiddenNum?: boolean
}

const QueryFilterContent = defineComponent<QueryFilterContentProps>({
  name: 'QueryFilterContent',
  props: [
    'defaultCollapsed',
    'onCollapse',
    'collapsed',
    'resetText',
    'searchText',
    'searchGutter',
    'split',
    'form',
    'items',
    'submitter',
    'showLength',
    'collapseRender',
    'spanSize',
    'submitterColSpanProps',
    'baseClassName',
    'hashId',
    'optionRender',
    'ignoreRules',
    'preserve',
    'showHiddenNum',
  ],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()

    const [collapsed, setCollapsedInner] = useMergedState<boolean>(
      !!(props.defaultCollapsed && props.submitter),
      {
        value: computed(() => props.collapsed) as ComputedRef<boolean>,
      },
    )

    const onCollapseCallback = useRefFunction((c: boolean) => {
      props.onCollapse?.(c)
    })

    const setCollapsed = (updater: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof updater === 'function' ? updater(collapsed.value) : updater
      setCollapsedInner(next)
      queueMicrotask(() => {
        onCollapseCallback(next)
      })
    }

    return () => {
      const resetText = props.resetText || intl.getMessage('tableForm.reset', '重置')
      const searchText = props.searchText || intl.getMessage('tableForm.search', '搜索')

      const {
        optionRender,
        collapseRender,
        split,
        items,
        spanSize,
        showLength,
        searchGutter,
        showHiddenNum,
      } = props

      const submitter = (() => {
        if (!props.submitter || optionRender === false)
          return null

        const submitterProps = getVNodeProps(props.submitter)
        return cloneElement(props.submitter, {
          searchConfig: {
            resetText,
            submitText: searchText,
          },
          render: optionRender
            ? (_: unknown, dom: VNodeChild[]) =>
                optionRender(
                  {
                    ...props,
                    resetText,
                    searchText,
                  },
                  props,
                  dom,
                )
            : optionRender,
          ...submitterProps,
        })
      })()

      const { processedList, totalSpan, totalSize, lastRowUsedSpan } = processQueryFilterItems({
        items: flattenChildren(items),
        spanSize,
        collapsed: collapsed.value,
        showLength,
        preserve: props.preserve,
        ignoreRules: props.ignoreRules,
      })

      let renderSpan = 0
      const doms = processedList.map(({ itemDom, colSpan }, index) => {
        if (!itemDom)
          return null
        const itemProps = getVNodeProps(itemDom)
        if (itemProps.hidden)
          return itemDom

        if (24 - (renderSpan % 24) < colSpan)
          renderSpan += 24 - (renderSpan % 24)
        renderSpan += colSpan

        const isSplitLine = split && renderSpan % 24 === 0 && index < processedList.length - 1
        const itemKey = (isVNode(itemDom) && (itemDom.key || itemProps.name)) || index
        return (
          <Col
            key={itemKey}
            span={colSpan}
            class={clsx(
              `${props.baseClassName}-row-split`,
              isSplitLine && `${props.baseClassName}-row-split-line`,
              props.hashId,
            )}
          >
            {itemDom}
          </Col>
        )
      })

      const hiddenNum = showHiddenNum && processedList.filter(item => item.hidden).length
      const needCollapseRender = totalSpan >= 24 && totalSize > showLength
      const offset = calcSubmitterOffset(
        lastRowUsedSpan,
        props.submitterColSpanProps?.span ?? spanSize.span,
      )

      return (
        <Row gutter={searchGutter} justify="start" class={clsx(`${props.baseClassName}-row`, props.hashId)} key="resize-observer-row">
          {doms}
          {submitter
            ? (
                <Col
                  key="submitter"
                  span={spanSize.span}
                  offset={offset}
                  {...props.submitterColSpanProps}
                  style={{
                    textAlign: 'end',
                    ...props.submitterColSpanProps?.style,
                  }}
                >
                  <FormItem label=" " colon={false} class={clsx(`${props.baseClassName}-actions`, props.hashId)}>
                    <Actions
                      hiddenNum={hiddenNum}
                      key="pro-form-query-filter-actions"
                      collapsed={collapsed.value}
                      collapseRender={needCollapseRender ? collapseRender : false}
                      submitter={submitter}
                      setCollapsed={setCollapsed}
                    />
                  </FormItem>
                </Col>
              )
            : null}
        </Row>
      )
    }
  },
})

const defaultWidth = typeof document !== 'undefined' ? document?.body?.clientWidth : 1024

const QueryFilter = defineComponent<QueryFilterProps>({
  name: 'QueryFilter',
  inheritAttrs: false,
  setup(props, { slots }) {
    const containerRef = ref<HTMLElement | null>(null)
    const width = ref(typeof props.style?.width === 'number' ? props.style.width : defaultWidth)
    const prefixCls = useProPrefixCls('pro-query-filter')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const { token } = theme.useToken()
    let resizeObserver: ResizeObserver | undefined

    onMounted(() => {
      if (!containerRef.value || typeof ResizeObserver === 'undefined')
        return
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry?.contentRect.width)
          width.value = entry.contentRect.width
      })
      resizeObserver.observe(containerRef.value)
    })
    onBeforeUnmount(() => resizeObserver?.disconnect())

    const breakpointsConfig = computed(() => getBreakpointsConfig(token.value))
    const spanSize = computed(() => getSpanConfig(props.layout, width.value + 16, props.span, breakpointsConfig.value))
    const formItemFixStyle = computed<FormItemProps | undefined>(() => {
      const labelWidth = props.labelWidth ?? '80'
      if (labelWidth && spanSize.value.layout !== 'vertical' && labelWidth !== 'auto') {
        return {
          labelCol: {
            flex: `0 0 ${labelWidth}px`,
          },
          wrapperCol: {
            style: {
              maxWidth: `calc(100% - ${labelWidth}px)`,
            },
          },
          style: {
            flexWrap: 'nowrap',
          },
        } as FormItemProps
      }
      return undefined
    })

    return () => {
      const {
        collapsed: controlCollapsed,
        layout: _layout,
        defaultCollapsed = true,
        defaultColsNumber,
        defaultFormItemsNumber,
        span: _span,
        searchGutter = 24,
        searchText,
        resetText,
        optionRender,
        collapseRender,
        onReset,
        onCollapse,
        labelWidth: _labelWidth,
        style,
        split,
        preserve = true,
        ignoreRules,
        showHiddenNum = false,
        submitterColSpanProps,
        containerStyle,
        className,
        ...rest
      } = props

      const showLength = (() => {
        if (defaultFormItemsNumber !== undefined)
          return defaultFormItemsNumber
        if (defaultColsNumber !== undefined) {
          const oneRowControlsNumber = 24 / spanSize.value.span - 1
          return defaultColsNumber > oneRowControlsNumber ? oneRowControlsNumber : defaultColsNumber
        }
        return Math.max(1, 24 / spanSize.value.span - 1)
      })()

      return wrapSSR(
        <div ref={containerRef} class={clsx(`${prefixCls.value}-container`, hashId)} style={containerStyle}>
          <BaseForm
            {...rest}
            isKeyPressSubmit
            preserve={preserve}
            onReset={onReset}
            style={style}
            class={clsx(prefixCls.value, hashId, className)}
            layout={spanSize.value.layout}
            formComponentType="QueryFilter"
            fieldProps={{ style: { width: '100%' } }}
            formItemProps={formItemFixStyle.value}
            groupProps={{
              titleStyle: {
                display: 'inline-block',
                marginInlineEnd: 16,
              },
            }}
            contentRender={(items: VNodeChild[], renderSubmitter: VNodeChild, form: ProFormInstance<any>) => (
              <QueryFilterContent
                spanSize={spanSize.value}
                collapsed={controlCollapsed}
                form={form}
                submitterColSpanProps={submitterColSpanProps}
                collapseRender={collapseRender}
                defaultCollapsed={defaultCollapsed}
                onCollapse={onCollapse}
                optionRender={optionRender}
                submitter={renderSubmitter}
                items={items}
                split={split}
                baseClassName={prefixCls.value}
                hashId={hashId}
                resetText={resetText}
                searchText={searchText}
                searchGutter={searchGutter}
                preserve={preserve}
                ignoreRules={ignoreRules}
                showLength={showLength}
                showHiddenNum={showHiddenNum}
              />
            )}
          >
            {slots.default?.()}
          </BaseForm>
        </div>,
      )
    }
  },
})

export { QueryFilter }
export default QueryFilter
