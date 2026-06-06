import type { App } from 'vue'
import DragSortTable from './components/DragSortTable'
import TableDropdown from './components/Dropdown'
import EditableProTable from './components/EditableTable'
import { CellEditorTable } from './components/EditableTable/CellEditorTable'
import { RowEditorTable } from './components/EditableTable/RowEditorTable'
import Search from './components/Form'
import ListToolBar from './components/ListToolBar'
import ProTable from './Table'

const TableModule = {
  install(app: App) {
    ;[
      ProTable,
      EditableProTable,
      DragSortTable,
      TableDropdown,
      ListToolBar,
      Search,
    ].forEach((component: any) => {
      if (component?.name)
        app.component(component.name, component)
    })
  },
}

export {
  CellEditorTable,
  DragSortTable,
  EditableProTable,
  ListToolBar,
  ProTable,
  RowEditorTable,
  Search,
  TableDropdown,
  TableModule,
}

export type { RowEditableConfig } from '../utils'
export type { DragTableProps } from './components/DragSortTable'
export type { ColumnsState } from './Store/Provide'
export type {
  ActionType,
  EditableFormInstance,
  EditableProTableProps,
  FilterValue,
  ProColumns,
  ProColumnType,
  ProTableProps,
  RequestData,
} from './typing'

export default ProTable
