import type { ProTableProps } from '../../typing'
import { HolderOutlined } from '@antdv-next/icons'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import ProTable from '../../Table'
import { resolveTableViewDefaultDom } from '../../utils'
import useStyle from './style'

export type DragTableProps<T = any, U = any> = ProTableProps<T, U> & {
  dragSortKey?: string
  dragSortHandlerRender?: (rowData: T, idx: number) => any
  onDragSortEnd?: (newDataSource: T[], beforeIndex: number, afterIndex: number) => Promise<void> | void
}

function arrayMove<T>(data: T[], from: number, to: number) {
  const next = [...data]
  const [item] = next.splice(from, 1)
  if (item !== undefined)
    next.splice(to, 0, item)
  return next
}

const DragSortTableImpl = defineComponent({
  name: 'DragSortTable',
  inheritAttrs: false,
  props: [
    'dragSortKey',
    'dragSortHandlerRender',
    'onDragSortEnd',
    'columns',
    'dataSource',
    'defaultData',
    'onDataSourceChange',
    'onLoad',
    'rowKey',
    'components',
  ],
  setup(props, { attrs }) {
    const prefixCls = useProPrefixCls('pro-table-drag')
    let styleResult: ReturnType<typeof useStyle>
    try {
      styleResult = useStyle(prefixCls.value)
    }
    catch {
      styleResult = {
        wrapSSR: node => node,
        hashId: '',
      } as ReturnType<typeof useStyle>
    }
    const { wrapSSR, hashId } = styleResult
    const dataSource = ref<any[]>(props.dataSource || props.defaultData || [])
    const dragState = ref<{ index: number, startY: number, currentY: number }>()

    watch(() => props.dataSource, (next) => {
      if (next)
        dataSource.value = [...next]
    }, { deep: true })

    function setDataSource(next: any[]) {
      dataSource.value = next
      props.onDataSourceChange?.(next)
    }

    function finishDrag(_index: number) {
      const state = dragState.value
      dragState.value = undefined
      if (!state)
        return
      const direction = state.currentY < state.startY ? -1 : state.currentY > state.startY ? 1 : 0
      if (!direction)
        return
      const afterIndex = Math.max(0, Math.min(dataSource.value.length - 1, state.index + direction))
      if (afterIndex === state.index)
        return
      const next = arrayMove(dataSource.value, state.index, afterIndex)
      setDataSource(next)
      props.onDragSortEnd?.(next, state.index, afterIndex)
    }

    function renderHandle(record: any, index: number) {
      const iconCls = `${prefixCls.value || 'ant-pro-table-drag'}-icon`
      const defaultDom = <HolderOutlined class={[iconCls, hashId]} />
      const handle = props.dragSortHandlerRender
        ? props.dragSortHandlerRender(record, index)
        : defaultDom
      return (
        <span
          class={[iconCls, 'ant-pro-table-drag-icon', hashId]}
          aria-roledescription="sortable"
          data-row-index={index}
          onMousedown={(event: MouseEvent) => {
            dragState.value = { index, startY: event.clientY || 0, currentY: event.clientY || 0 }
          }}
          onMousemove={(event: MouseEvent) => {
            if (dragState.value)
              dragState.value.currentY = event.clientY || dragState.value.currentY
          }}
          onMouseup={() => finishDrag(index)}
          onMouseleave={() => {
            if (dragState.value?.index === index)
              finishDrag(index)
          }}
        >
          {handle}
        </span>
      )
    }

    const processedColumns = computed(() => {
      const dragSortKey = props.dragSortKey
      let injected = false
      const columns = (props.columns || []).map((column: any) => {
        const matched = dragSortKey && (column.dataIndex === dragSortKey || column.key === dragSortKey)
        if (!matched)
          return column
        injected = true
        return {
          ...column,
          render: (dom: any, rowData: any, index: number, action: any, schema: any) => {
            const originDom = column.render
              ? column.render(dom, rowData, index, action, schema)
              : dom
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {renderHandle(rowData, index)}
                {originDom}
              </span>
            )
          },
        }
      })

      if (!injected && dragSortKey) {
        columns.unshift({
          title: '',
          dataIndex: dragSortKey,
          key: dragSortKey,
          width: 40,
          render: (_dom: any, record: any, index: number) => renderHandle(record, index),
        })
      }
      return columns
    })

    function wrapOnLoad(next: any[], extra?: any) {
      setDataSource(next)
      return props.onLoad?.(next, extra)
    }

    return () => wrapSSR(
      <ProTable
        {...attrs as any}
        {...props as any}
        search={(attrs as any).search ?? false}
        dataSource={dataSource.value}
        columns={processedColumns.value}
        onLoad={wrapOnLoad}
        onDataSourceChange={props.onDataSourceChange}
        tableViewRender={(_: any, defaultDom: any) => resolveTableViewDefaultDom(defaultDom)}
      />,
    )
  },
})

const DragSortTable = DragSortTableImpl as typeof DragSortTableImpl & {
  new(): { $props: DragTableProps<any, any> }
}

export default DragSortTable
