import type { App } from 'vue'
import type { RowEditableConfig } from '../utils'
import type { DragTableProps } from './components/DragSortTable'
import type {
  EditableFormInstance,
  EditableProTableProps,
} from './components/EditableTable'
import type { ListToolBarProps } from './components/ListToolBar'
import type { ColumnsState } from './Store/Provide'
import type {
  ActionType,
  ProColumns,
  ProColumnType,
  ProTableProps,
  RequestData,
} from './typing'
import DragSortTable from './components/DragSortTable'
import TableDropdown from './components/Dropdown'
import EditableProTable from './components/EditableTable'
import { CellEditorTable } from './components/EditableTable/CellEditorTable'
import { RowEditorTable } from './components/EditableTable/RowEditorTable'
import Search from './components/Form'
import ListToolBar from './components/ListToolBar'
import ProTable from './Table'

/** Vue 插件：注册表格相关组件，mirror FormModule */
export const TableModule = {
  install(app: App) {
    app.component('ProTable', ProTable)
    app.component('EditableProTable', EditableProTable)
    app.component('DragSortTable', DragSortTable)
    app.component('ListToolBar', ListToolBar)
    app.component('TableDropdown', TableDropdown)
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
}

export type {
  ActionType,
  ColumnsState,
  DragTableProps,
  EditableFormInstance,
  EditableProTableProps,
  ListToolBarProps,
  ProColumns,
  ProColumnType,
  ProTableProps,
  RequestData,
  RowEditableConfig,
}

export default ProTable
