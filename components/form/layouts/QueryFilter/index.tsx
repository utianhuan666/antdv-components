import type { ColProps, FormProps, RowProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { Col, FormItem, Row } from 'antdv-next'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import BaseForm from '../../BaseForm'
import { flattenChildren, getVNodeProps } from '../_shared/vueHelpers'
import Actions from './Actions'
import { calcSubmitterOffset, processQueryFilterItems } from './processQueryFilterItems'
import { useStyle } from './style'

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

function getSpanConfig(layout: FormProps['layout'], width: number, span?: SpanConfig) {
  if (typeof span === 'number')
    return { span, layout }
  if (span) {
    const config = [
      [576, span.xs],
      [768, span.sm],
      [992, span.md],
      [1200, span.lg],
      [1600, span.xl],
      [Infinity, span.xxl],
    ] as const
    const found = config.find(([point]) => width < point + 16)
    return { span: 24 / (found?.[1] || 3), layout: 'horizontal' as FormProps['layout'] }
  }
  if (layout === 'vertical')
    return { span: width < 992 ? 12 : width < 1600 ? 8 : 6, layout: 'vertical' as FormProps['layout'] }
  if (width < 768)
    return { span: 12, layout: 'vertical' as FormProps['layout'] }
  return { span: width < 1600 ? 8 : 6, layout: 'horizontal' as FormProps['layout'] }
}

export const QueryFilter = defineComponent({
  name: 'QueryFilter',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const containerRef = ref<HTMLElement | null>(null)
    const width = ref(1024)
    const innerCollapsed = ref((attrs.defaultCollapsed as boolean | undefined) ?? true)
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-query-filter')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
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

    const spanSize = computed(() => getSpanConfig(attrs.layout as FormProps['layout'], width.value + 16, attrs.span as SpanConfig | undefined))

    return () => {
      const props = attrs as QueryFilterProps
      const preserve = props.preserve ?? true
      const resetText = props.resetText || intl.getMessage('tableForm.reset', '重置')
      const searchText = props.searchText || intl.getMessage('tableForm.search', '搜索')
      const baseSubmitter = (props as any).submitter
      const mergedSubmitter = baseSubmitter === false
        ? false
        : {
            ...(typeof baseSubmitter === 'object' ? baseSubmitter : {}),
            searchConfig: {
              resetText,
              submitText: searchText,
              ...(typeof baseSubmitter === 'object' ? baseSubmitter?.searchConfig : undefined),
            },
          }
      const collapsed = props.collapsed ?? innerCollapsed.value
      const setCollapsed = (nextCollapsed: boolean) => {
        innerCollapsed.value = nextCollapsed
        props.onCollapse?.(nextCollapsed)
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
            {...props as any}
            submitter={mergedSubmitter}
            isKeyPressSubmit
            preserve={preserve}
            class={clsx(prefixCls.value, hashId, props.className)}
            layout={spanSize.value.layout}
            formComponentType="QueryFilter"
            fieldProps={{ style: { width: '100%' } }}
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
                return (
                  <Col key={(itemDom as any)?.key || itemProps.name || index} span={colSpan} class={clsx(`${prefixCls.value}-row-split`)}>
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
                <Row gutter={props.searchGutter ?? 24} justify="start" class={`${prefixCls.value}-row`}>
                  {doms}
                  {submitter
                    ? (
                        <Col span={spanSize.value.span} offset={offset} {...props.submitterColSpanProps as any} style={{ textAlign: 'end', ...(props.submitterColSpanProps as any)?.style }}>
                          <FormItem label=" " colon={false} class={`${prefixCls.value}-actions`}>
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
