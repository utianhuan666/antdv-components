import type { ColProps, FormItemProps, FormProps, RowProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { Col, FormItem, Row, theme } from 'antdv-next'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import BaseForm from '../../BaseForm'
import { flattenChildren, getVNodeProps } from '../_shared/vueHelpers'
import Actions from './Actions'
import { calcSubmitterOffset, processQueryFilterItems } from './processQueryFilterItems'
import { useStyle } from './style'

type BreakpointsConfig = {
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

export type SpanConfig = number | {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface BaseQueryFilterProps {
  className?: string
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  layout?: FormProps['layout']
  defaultColsNumber?: number
  defaultFormItemsNumber?: number
  labelWidth?: number | 'auto'
  split?: boolean
  span?: SpanConfig
  searchText?: string
  resetText?: string
  searchGutter?: RowProps['gutter']
  optionRender?: ((searchConfig: any, props: any, dom: VNodeChild[]) => VNodeChild[]) | false
  collapseRender?: ((collapsed: boolean, props: any, intl: any, hiddenNum?: false | number) => VNodeChild) | false
  ignoreRules?: boolean
  showHiddenNum?: boolean
  submitterColSpanProps?: Omit<ColProps, 'span'> & { span: number }
  containerStyle?: CSSProperties
  preserve?: boolean
}

export type QueryFilterProps<T = Record<string, any>, U = Record<string, any>> = ProFormProps<T, U> & BaseQueryFilterProps & {
  onReset?: (values: T) => void
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

const defaultWidth = typeof document !== 'undefined' ? document?.body?.clientWidth : 1024

export const QueryFilter = defineComponent<QueryFilterProps>({
  name: 'QueryFilter',
  inheritAttrs: false,
  setup(props, { slots }) {
    const containerRef = ref<HTMLElement | null>(null)
    const width = ref(typeof props.style?.width === 'number' ? props.style.width : defaultWidth)
    const innerCollapsed = ref((props.defaultCollapsed ?? true) && props.submitter !== false)
    const intl = useIntl()
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
        }
      }
      return undefined
    })

    return () => {
      const preserve = props.preserve ?? true
      const resetText = props.resetText || intl.getMessage('tableForm.reset', '重置')
      const searchText = props.searchText || intl.getMessage('tableForm.search', '搜索')
      const baseSubmitter = props.submitter
      const mergedSubmitter = baseSubmitter === false
        ? false
        : {
            ...(typeof baseSubmitter === 'object' ? baseSubmitter : {}),
            searchConfig: {
              resetText,
              submitText: searchText,
              ...(typeof baseSubmitter === 'object' ? baseSubmitter?.searchConfig : undefined),
            },
            render: props.optionRender
              ? (_: unknown, dom: VNodeChild[]) =>
                  props.optionRender?.(
                    {
                      ...props,
                      resetText,
                      searchText,
                    },
                    props,
                    dom,
                  )
              : typeof baseSubmitter === 'object'
                ? baseSubmitter.render
                : undefined,
          }
      const collapsed = props.collapsed ?? innerCollapsed.value
      const setCollapsed = (nextCollapsed: boolean) => {
        if (props.collapsed === undefined)
          innerCollapsed.value = nextCollapsed
        queueMicrotask(() => props.onCollapse?.(nextCollapsed))
      }
      const showLength = (() => {
        if (props.defaultFormItemsNumber !== undefined)
          return props.defaultFormItemsNumber
        if (props.defaultColsNumber !== undefined) {
          const oneRowControlsNumber = 24 / spanSize.value.span - 1
          return props.defaultColsNumber > oneRowControlsNumber ? oneRowControlsNumber : props.defaultColsNumber
        }
        return Math.max(1, 24 / spanSize.value.span - 1)
      })()

      return wrapSSR(
        <div ref={containerRef} class={`${prefixCls.value}-container`} style={props.containerStyle}>
          <BaseForm
            {...props}
            submitter={mergedSubmitter}
            isKeyPressSubmit
            preserve={preserve}
            class={clsx(prefixCls.value, hashId, props.className)}
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
            contentRender={(items: VNodeChild[], renderSubmitter: VNodeChild) => {
              const { processedList, totalSpan, totalSize, lastRowUsedSpan } = processQueryFilterItems({
                items: flattenChildren(items),
                spanSize: spanSize.value,
                collapsed,
                showLength,
                preserve,
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
                const isSplitLine = props.split && renderSpan % 24 === 0 && index < processedList.length - 1
                return (
                  <Col
                    key={itemDom.key || itemProps.name || index}
                    span={colSpan}
                    class={clsx(
                      `${prefixCls.value}-row-split`,
                      isSplitLine && `${prefixCls.value}-row-split-line`,
                      hashId,
                    )}
                  >
                    {itemDom}
                  </Col>
                )
              })
              const hiddenNum = props.showHiddenNum && processedList.filter(item => item.hidden).length
              const submitterSpan = props.submitterColSpanProps?.span ?? spanSize.value.span
              const offset = calcSubmitterOffset(lastRowUsedSpan, submitterSpan)
              const needCollapseRender = totalSpan >= 24 && totalSize > showLength
              const submitter = props.optionRender === false ? null : renderSubmitter

              return (
                <Row gutter={props.searchGutter ?? 24} justify="start" class={clsx(`${prefixCls.value}-row`, hashId)}>
                  {doms}
                  {submitter
                    ? (
                        <Col span={spanSize.value.span} offset={offset} {...props.submitterColSpanProps} style={{ textAlign: 'end', ...props.submitterColSpanProps?.style }}>
                          <FormItem label=" " colon={false} shouldUpdate={false} class={clsx(`${prefixCls.value}-actions`, hashId)}>
                            <Actions
                              hiddenNum={hiddenNum}
                              collapsed={collapsed}
                              collapseRender={needCollapseRender ? props.collapseRender : false}
                              submitter={submitter}
                              setCollapsed={setCollapsed}
                            />
                          </FormItem>
                        </Col>
                      )
                    : null}
                </Row>
              )
            }}
          >
            {slots.default?.()}
          </BaseForm>
        </div>,
      )
    }
  },
})

export default QueryFilter
