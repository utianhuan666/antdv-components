// TODO Phase 5: full mirror port pending
import type { ParamsType } from '../../../provider'
import type { ProColumns, ProTableProps } from '../../typing'
import { defineComponent } from 'vue'
import ProTable from '../../Table'

export type DragTableProps<T, U extends ParamsType, ValueType = 'text'> = ProTableProps<
  T,
  U,
  ValueType
> & {
  /** @name 拖动排序列的key值 */
  dragSortKey?: string
  /** @name 渲染自定义拖动排序把手的函数 */
  dragSortHandlerRender?: (rowData: T, idx: number) => any
  /** @name 拖动排序完成回调 */
  onDragSortEnd?: (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: T[],
  ) => Promise<void> | void
  /** @name 拖动排序的列配置 */
  dragSortColumn?: ProColumns<T, ValueType>
}

/**
 * 临时占位：拖拽排序表格直接透传 ProTable，完整实现见 Phase 5。
 */
const DragSortTable = defineComponent({
  name: 'DragSortTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProTable {...attrs}>
        {slots.default?.()}
      </ProTable>
    )
  },
}) as any

export default DragSortTable
