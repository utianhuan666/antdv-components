import type { PropType, VNodeChild } from 'vue'
import type { CommonFormProps, ProFormGridConfig } from '../../typing'
import type { CollapseRender } from './Actions'
import type { QueryFilterLayout, SpanConfig } from './breakpoints'
import { useResizeObserver } from '@vueuse/core'
import { Col, FormItem, Row } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import Actions from './Actions'
import { getBreakpointsConfig, getSpanConfig } from './breakpoints'
import { calcSubmitterOffset, processQueryFilterItems } from './processItems'

export interface QueryFilterProps extends CommonFormProps, ProFormGridConfig {
  layout?: QueryFilterLayout
  collapsed?: boolean
  defaultCollapsed?: boolean
  defaultColsNumber?: number
  defaultFormItemsNumber?: number
  labelWidth?: number | 'auto'
  split?: boolean
  span?: SpanConfig
  searchText?: string
  resetText?: string
  searchGutter?: number | [number, number]
  preserve?: boolean
  ignoreRules?: boolean
  showHiddenNum?: boolean
  collapseRender?: CollapseRender
  submitterColSpanProps?: Record<string, any> & { span: number }
  containerStyle?: Record<string, any>
  optionRender?: false | ((searchConfig: any, props: any, dom: VNodeChild[]) => VNodeChild[])
  onCollapse?: (collapsed: boolean) => void
}

const defaultWidth = typeof window !== 'undefined' ? window.document?.body?.clientWidth || 1024 : 1024

/**
 * 对标 React `src/form/layouts/QueryFilter/index.tsx`：
 * 1. 监听容器宽度，按 antd 设计 token 推导 span/layout
 * 2. 支持 `defaultCollapsed` / `defaultColsNumber` / `defaultFormItemsNumber` 控制折叠
 * 3. 通过 BaseForm.contentRender 注入 Row + Col 布局并附加 submitter
 */
const QueryFilter = defineComponent({
  name: 'QueryFilter',
  inheritAttrs: false,
  props: {
    layout: { type: String as PropType<QueryFilterLayout>, default: undefined },
    collapsed: { type: Boolean, default: undefined },
    defaultCollapsed: { type: Boolean, default: true },
    defaultColsNumber: { type: Number, default: undefined },
    defaultFormItemsNumber: { type: Number, default: undefined },
    labelWidth: { type: [Number, String] as PropType<number | 'auto'>, default: 80 },
    split: { type: Boolean, default: false },
    span: { type: [Number, Object] as PropType<SpanConfig>, default: undefined },
    searchText: { type: String, default: undefined },
    resetText: { type: String, default: undefined },
    searchGutter: { type: [Number, Array] as PropType<number | [number, number]>, default: 24 },
    preserve: { type: Boolean, default: true },
    ignoreRules: { type: Boolean, default: undefined },
    showHiddenNum: { type: Boolean, default: false },
    collapseRender: { type: [Function, Boolean] as PropType<CollapseRender>, default: undefined },
    submitterColSpanProps: { type: Object as PropType<Record<string, any> & { span: number }>, default: undefined },
    containerStyle: { type: Object as PropType<Record<string, any>>, default: undefined },
    optionRender: {
      type: [Function, Boolean] as PropType<QueryFilterProps['optionRender']>,
      default: undefined,
    },
    onCollapse: { type: Function as PropType<(collapsed: boolean) => void>, default: undefined },
  },
  emits: ['collapse'],
  setup(props, { attrs, slots, emit, expose }) {
    const baseRef = shallowRef<any>()
    const containerRef = ref<HTMLElement | null>(null)
    const width = ref<number>(defaultWidth)
    const internalCollapsed = ref<boolean>(props.defaultCollapsed)

    const isControlled = computed(() => props.collapsed !== undefined)
    const collapsed = computed(() => (isControlled.value ? !!props.collapsed : internalCollapsed.value))

    function setCollapsed(next: boolean) {
      if (!isControlled.value)
        internalCollapsed.value = next
      emit('collapse', next)
      props.onCollapse?.(next)
    }

    useResizeObserver(containerRef, (entries) => {
      const entry = entries[0]
      if (!entry)
        return
      const next = entry.contentRect.width
      if (next > 17 && next !== width.value)
        width.value = next
    })

    const breakpointsConfig = computed(() => getBreakpointsConfig({}))

    const spanSize = computed(() => {
      return getSpanConfig(props.layout, width.value + 16, props.span, breakpointsConfig.value)
    })

    const showLength = computed(() => {
      if (props.defaultFormItemsNumber !== undefined)
        return props.defaultFormItemsNumber
      if (props.defaultColsNumber !== undefined) {
        const oneRowControlsNumber = 24 / spanSize.value.span - 1
        return props.defaultColsNumber > oneRowControlsNumber
          ? oneRowControlsNumber
          : props.defaultColsNumber
      }
      return Math.max(1, 24 / spanSize.value.span - 1)
    })

    const formItemFixStyle = computed(() => {
      const labelWidth = props.labelWidth
      if (labelWidth && spanSize.value.layout !== 'vertical' && labelWidth !== 'auto') {
        return {
          labelCol: { flex: `0 0 ${labelWidth}px` },
          wrapperCol: { style: { maxWidth: `calc(100% - ${labelWidth}px)` } },
          style: { flexWrap: 'nowrap' },
        }
      }
      return undefined
    })

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      getFieldsFormatValue: (...args: any[]) => baseRef.value?.getFieldsFormatValue?.(...args),
    })

    function renderContent(items: VNodeChild, submitter: VNodeChild | undefined) {
      const { processedList, totalSpan, totalSize, lastRowUsedSpan } = processQueryFilterItems({
        items,
        spanSize: spanSize.value,
        collapsed: collapsed.value,
        showLength: showLength.value,
        preserve: props.preserve,
        ignoreRules: props.ignoreRules,
      })

      let renderSpan = 0
      const doms = processedList.map((entry, index) => {
        if (entry.hidden && !props.preserve)
          return null
        const { itemDom, colSpan, hidden } = entry
        if (24 - (renderSpan % 24) < colSpan)
          renderSpan += 24 - (renderSpan % 24)
        renderSpan += colSpan

        const isSplitLine
          = props.split && renderSpan % 24 === 0 && index < processedList.length - 1

        const colStyle = hidden ? { display: 'none' } : undefined
        return (
          <Col
            key={(itemDom as any)?.key ?? index}
            span={colSpan}
            class={[
              'ant-pro-query-filter-row-split',
              isSplitLine ? 'ant-pro-query-filter-row-split-line' : '',
            ]}
            style={colStyle}
          >
            {itemDom}
          </Col>
        )
      })

      const hiddenNum = props.showHiddenNum
        ? processedList.filter(entry => entry.hidden).length
        : false
      const needCollapseRender = totalSpan >= 24 && totalSize > showLength.value
      const submitterSpan = props.submitterColSpanProps?.span ?? spanSize.value.span
      const offset = calcSubmitterOffset(lastRowUsedSpan, submitterSpan)

      const collapseRender = needCollapseRender ? props.collapseRender : false

      return (
        <Row
          gutter={props.searchGutter as any}
          justify="start"
          class="ant-pro-query-filter-row"
        >
          {doms}
          {submitter
            ? (
                <Col
                  key="submitter"
                  {...(props.submitterColSpanProps || {})}
                  span={submitterSpan}
                  offset={offset}
                  style={{ textAlign: 'end' }}
                >
                  <FormItem label=" " colon={false} class="ant-pro-query-filter-actions">
                    <Actions
                      submitter={submitter}
                      collapsed={collapsed.value}
                      setCollapsed={setCollapsed}
                      collapseRender={collapseRender}
                      hiddenNum={hiddenNum}
                    />
                  </FormItem>
                </Col>
              )
            : null}
        </Row>
      )
    }

    return () => (
      <div
        ref={containerRef}
        class="ant-pro-query-filter-container"
        style={props.containerStyle}
      >
        <BaseForm
          ref={baseRef}
          isKeyPressSubmit
          layout={spanSize.value.layout as any}
          fieldProps={{ style: { width: '100%' } }}
          formItemProps={formItemFixStyle.value as any}
          contentRender={(items, submitter) => renderContent(items, submitter)}
          {...attrs}
          class={['ant-pro-query-filter', (attrs as any).class].filter(Boolean).join(' ')}
        >
          {{
            default: () => slots.default?.(),
            submitter: slots.submitter
              ? (slotProps: Record<string, any>) => slots.submitter?.(slotProps)
              : undefined,
          }}
        </BaseForm>
      </div>
    )
  },
})

export default QueryFilter
export { QueryFilter }
