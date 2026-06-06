import type { ColProps, FormItemProps, FormProps, RowProps } from 'antdv-next'
import type { CSSProperties, FunctionalComponent, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike, ProFormGridConfig } from '../../typing'
import type { CollapseRender } from './Actions'
import type { QueryFilterLayout, SpanConfig } from './breakpoints'
import { useResizeObserver } from '@vueuse/core'
import { Col, FormItem, Row } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { deleteValueByNamePath, normalizeNamePath } from '../../../utils'
import { BaseForm } from '../../BaseForm'
import Actions from './Actions'
import { getBreakpointsConfig, getSpanConfig } from './breakpoints'
import { calcSubmitterOffset, processQueryFilterItems } from './processItems'

export interface BaseQueryFilterProps {
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
  submitterColSpanProps?: Omit<ColProps, 'span'> & { span: number }
  containerStyle?: CSSProperties
  optionRender?: false | ((
    searchConfig: Omit<BaseQueryFilterProps, 'optionRender'>,
    props: BaseQueryFilterProps,
    dom: VNodeChild[],
  ) => VNodeChild[])
  onCollapse?: (collapsed: boolean) => void
}

export type QueryFilterProps<T = FormData, U = FormData> = Omit<FormProps, 'onFinish'> & CommonFormProps<T, U> & ProFormGridConfig & BaseQueryFilterProps

const defaultWidth = typeof window !== 'undefined' ? window.document?.body?.clientWidth || 1024 : 1024

const queryFilterPropNames = [
  'layout',
  'collapsed',
  'defaultCollapsed',
  'defaultColsNumber',
  'defaultFormItemsNumber',
  'labelWidth',
  'split',
  'span',
  'searchText',
  'resetText',
  'searchGutter',
  'preserve',
  'ignoreRules',
  'showHiddenNum',
  'collapseRender',
  'submitterColSpanProps',
  'containerStyle',
  'optionRender',
  'onCollapse',
] as const

function resolveBoolean(value: unknown, fallback?: boolean) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

/**
 * 对标 React `src/form/layouts/QueryFilter/index.tsx`：
 * 1. 监听容器宽度，按 antd 设计 token 推导 span/layout
 * 2. 支持 `defaultCollapsed` / `defaultColsNumber` / `defaultFormItemsNumber` 控制折叠
 * 3. 通过 BaseForm.contentRender 注入 Row + Col 布局并附加 submitter
 */
const QueryFilterImpl = defineComponent({
  name: 'QueryFilter',
  inheritAttrs: false,
  props: [...queryFilterPropNames],
  emits: ['collapse'],
  setup(rawProps, { attrs, slots, emit, expose }) {
    const props = rawProps as Readonly<QueryFilterProps>
    const prefixCls = useProPrefixCls('pro-query-filter')
    const baseRef = shallowRef<FormRefLike>()
    const containerRef = ref<HTMLElement | null>(null)
    const width = ref<number>(defaultWidth)
    const internalCollapsed = ref<boolean>(resolveBoolean(props.defaultCollapsed, true)!)
    const hiddenNamePaths = shallowRef<(string | number)[][]>([])

    const isControlled = computed(() => props.collapsed !== undefined)
    const collapsed = computed(() => (isControlled.value ? resolveBoolean(props.collapsed, false)! : internalCollapsed.value))
    const preserve = computed(() => resolveBoolean(props.preserve, true)!)

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
      const labelWidth = props.labelWidth ?? 80
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
      getFieldsFormatValue: (allData?: true, omitNil?: boolean) => baseRef.value?.getFieldsFormatValue?.(allData, omitNil),
    })

    function filterHiddenValues(values: FormData) {
      if (preserve.value || hiddenNamePaths.value.length === 0)
        return values
      const nextValues = { ...(values || {}) }
      hiddenNamePaths.value.forEach(namePath => deleteValueByNamePath(nextValues, namePath))
      return nextValues
    }

    async function handleFinish(values: FormData): Promise<boolean | void> {
      const filteredValues = filterHiddenValues(values)
      return (attrs.onFinish as ((values: FormData) => boolean | void | Promise<boolean | void>) | undefined)?.(filteredValues)
    }

    function renderContent(items: VNodeChild, submitter: VNodeChild | undefined) {
      const { processedList, totalSpan, totalSize, lastRowUsedSpan } = processQueryFilterItems({
        items,
        spanSize: spanSize.value,
        collapsed: collapsed.value,
        showLength: showLength.value,
        preserve: preserve.value,
        ignoreRules: resolveBoolean(props.ignoreRules),
      })

      hiddenNamePaths.value = processedList
        .filter(entry => entry.hidden && entry.name !== undefined)
        .map(entry => normalizeNamePath(entry.name as string | number | (string | number)[]))
        .filter(Boolean) as (string | number)[][]

      let renderSpan = 0
      const doms = processedList.map((entry, index) => {
        if (entry.hidden && !preserve.value)
          return null
        const { itemDom, colSpan, hidden } = entry
        if (24 - (renderSpan % 24) < colSpan)
          renderSpan += 24 - (renderSpan % 24)
        renderSpan += colSpan

        const isSplitLine
          = resolveBoolean(props.split, false) && renderSpan % 24 === 0 && index < processedList.length - 1

        const colStyle = hidden ? { display: 'none' } : undefined
        return (
          <Col
            key={itemDom && typeof itemDom === 'object' && 'key' in itemDom ? itemDom.key ?? undefined : index}
            span={colSpan}
            class={[
              `${prefixCls.value}-row-split`,
              isSplitLine ? `${prefixCls.value}-row-split-line` : '',
            ]}
            style={colStyle}
          >
            {itemDom}
          </Col>
        )
      })

      const hiddenNum = resolveBoolean(props.showHiddenNum, false)
        ? processedList.filter(entry => entry.hidden).length
        : false
      const needCollapseRender = totalSpan >= 24 && totalSize > showLength.value
      const submitterSpan = props.submitterColSpanProps?.span ?? spanSize.value.span
      const offset = calcSubmitterOffset(lastRowUsedSpan, submitterSpan)

      const collapseRender = needCollapseRender ? props.collapseRender : false

      return (
        <Row
          gutter={(props.searchGutter ?? 24) as RowProps['gutter']}
          justify="start"
          class={`${prefixCls.value}-row`}
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
                  <FormItem label=" " colon={false} class={`${prefixCls.value}-actions`}>
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

    return () => {
      const {
        onFinish: _onFinish,
        class: attrsClass,
        ...restAttrs
      } = attrs as FormData
      const baseFormAttrs = {
        ...restAttrs,
        class: [prefixCls.value, attrsClass].filter(Boolean).join(' '),
      }

      return (
        <div
          ref={containerRef}
          class={`${prefixCls.value}-container`}
          style={props.containerStyle}
        >
          <BaseForm
            ref={baseRef}
            isKeyPressSubmit
            layout={spanSize.value.layout as FormProps['layout']}
            fieldProps={{ style: { width: '100%' } }}
            formItemProps={formItemFixStyle.value as FormItemProps | undefined}
            contentRender={(items, submitter) => renderContent(items, submitter)}
            {...baseFormAttrs as any}
            onFinish={handleFinish}
          >
            {{
              default: () => slots.default?.(),
              submitter: slots.submitter
                ? (slotProps: FormData) => slots.submitter?.(slotProps)
                : undefined,
            }}
          </BaseForm>
        </div>
      )
    }
  },
})

const QueryFilter = QueryFilterImpl as unknown as FunctionalComponent<QueryFilterProps>

export default QueryFilter
export { QueryFilter }
