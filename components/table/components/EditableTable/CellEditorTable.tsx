// TODO Phase 4: full mirror port pending
import { defineComponent } from 'vue'
import ProTable from '../../Table'

/**
 * 临时占位：单元格编辑表格，完整实现见 Phase 4。
 */
export const CellEditorTable = defineComponent({
  name: 'CellEditorTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProTable {...attrs}>
        {slots.default?.()}
      </ProTable>
    )
  },
}) as any

export default CellEditorTable
