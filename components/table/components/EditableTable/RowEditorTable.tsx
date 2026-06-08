// TODO Phase 4: full mirror port pending
import { defineComponent } from 'vue'
import ProTable from '../../Table'

/**
 * 临时占位：整行编辑表格，完整实现见 Phase 4。
 */
export const RowEditorTable = defineComponent({
  name: 'RowEditorTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProTable {...attrs}>
        {slots.default?.()}
      </ProTable>
    )
  },
}) as any

export default RowEditorTable
