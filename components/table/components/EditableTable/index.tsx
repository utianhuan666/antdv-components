// TODO Phase 4: full mirror port pending
import type { ProFormInstance } from '../../../form'
import type { ParamsType } from '../../../provider'
import type { ProTableProps } from '../../typing'
import { defineComponent } from 'vue'
import ProTable from '../../Table'

export type EditableProTableProps<T, U extends ParamsType, ValueType = 'text'> = Omit<
  ProTableProps<T, U, ValueType>,
  'rowSelection'
> & {
  value?: T[]
  onChange?: (value: T[]) => void
  recordCreatorProps?:
    | false
    | (Record<string, any> & {
      record: (index: number, dataSource: T[]) => T
    })
  maxLength?: number
  /** 显示一个添加按钮 */
  controlled?: boolean
}

export type EditableFormInstance<T = any> = ProFormInstance<T> & {
  getRowData?: (rowIndex: string | number) => T | undefined
  getRowsData?: () => T[] | undefined
  setRowData?: (rowIndex: string | number, data: Partial<T>) => void
}

/**
 * 临时占位：可编辑表格直接透传 ProTable，完整实现见 Phase 4。
 */
const EditableProTable = defineComponent({
  name: 'EditableProTable',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProTable {...attrs}>
        {slots.default?.()}
      </ProTable>
    )
  },
}) as any

export default EditableProTable
