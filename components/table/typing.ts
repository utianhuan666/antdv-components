import type {
  FormInstance,
  SpinProps,
  TableColumnType,
  TableProps,
} from 'antdv-next'
import type { CSSProperties, Ref, VNodeChild } from 'vue'
import type { ProCardProps } from '../card'
import type { ProFieldEmptyText } from '../field'
import type { ProFormInstance, ProFormProps, QueryFilterProps } from '../form'
import type { ProListSlot } from '../list/constants'
import type {
  LabelTooltipType,
  NamePath,
  PageInfo,
  ProCoreActionType,
  ProSchema,
  ProSchemaComponentTypes,
  SearchTransformKeyFn,
} from '../utils'
import type { RecordKey, RowEditableConfig, UseEditableUtilType } from '../utils/useEditableArray'
import type { AlertRenderType } from './components/Alert'
import type { ListToolBarProps } from './components/ListToolBar'
import type { OptionConfig, ToolBarProps } from './components/ToolBar'
import type { DensitySize } from './components/ToolBar/DensityIcon'
import type { ColumnsState } from './Store/Provide'

export type { PageInfo }

export type RequestData<T> = {
  data?: T[]
  success?: boolean
  total?: number
} & Record<string, any>

export type FilterValue = (string | number | boolean)[] | null
export type SortOrder = 'ascend' | 'descend' | null | undefined

export type ProSorter<T>
  = | string
    | boolean
    | ((a: T, b: T) => number)
    | {
      compare?: (a: T, b: T) => number
      multiple?: number
    }

export type ExtraProColumnType<T> = Omit<
  TableColumnType<T>,
  'children' | 'customRender' | 'dataIndex' | 'filters' | 'onFilter' | 'render' | 'sorter' | 'title'
> & {
  sorter?: ProSorter<T>
  children?: ProColumns<T>[]
  filters?: boolean | any[]
  onFilter?: boolean | ((value: any, record: T) => boolean)
  defaultFilteredValue?: any[]
  filteredValue?: any[]
  defaultSortOrder?: SortOrder
  sortOrder?: SortOrder
}

export type ProColumnType<T = unknown, ValueType = 'text'> = ProSchema<
  T,
  ExtraProColumnType<T> & {
    colSize?: number
    initialValue?: any
    ellipsis?: boolean | { showTitle?: boolean }
    copyable?: boolean
    search?: boolean | { transform: SearchTransformKeyFn }
    hideInTable?: boolean
    hideInSearch?: boolean
    hideInForm?: boolean
    hideInSetting?: boolean
    /**
     * Used by ProList to map the column into a list item slot.
     */
    listSlot?: ProListSlot
    order?: number
    readonly?: boolean
    disable?: boolean | { checkbox: boolean }
    index?: number
    render?: (
      dom: VNodeChild,
      entity: T,
      index: number,
      action: ActionType | undefined,
      schema: any,
    ) => VNodeChild | { children?: VNodeChild, props?: Record<string, any> }
  },
  ProSchemaComponentTypes,
  ValueType
>

export type ProColumns<T = any, ValueType = 'text'> = ProColumnType<T, ValueType>

export type BorderedType = 'search' | 'table'
export type Bordered = boolean | { search?: boolean, table?: boolean }

export interface ColumnStateType {
  persistenceType?: 'localStorage' | 'sessionStorage'
  persistenceKey?: string
  defaultValue?: Record<string, ColumnsState>
  value?: Record<string, ColumnsState>
  onChange?: (map: Record<string, ColumnsState>) => void
}

export interface UseFetchDataAction<T = any> {
  dataSource: T[]
  setDataSource: (dataSource: T[] | ((dataSource: T[]) => T[])) => void
  loading: boolean | SpinProps | undefined
  pageInfo: PageInfo
  reload: () => Promise<void>
  reset: () => Promise<void>
  pollingLoading: boolean
  setPageInfo: (pageInfo: Partial<PageInfo>) => Promise<void>
}

export type ActionType = ProCoreActionType<{
  nativeElement?: HTMLDivElement
  focus?: () => void
  fullScreen?: () => void
  setPageInfo?: (page: Partial<PageInfo>) => void
  scrollTo?: (arg: number | { index?: number, key?: string | number, top?: number }) => void
}, Partial<UseEditableUtilType>>

export interface TableFormItem<_T = any> {
  formRef?: Ref<FormInstance | ProFormInstance | undefined> | { current?: FormInstance | ProFormInstance }
}

export type ProTableProps<DataSource = Record<string, any>, U = Record<string, any>, ValueType = 'text'>
  = Omit<TableProps<DataSource>, 'columns' | 'rowSelection' | 'onChange'> & {
    columns?: ProColumns<DataSource, ValueType>[]
    toolbar?: ListToolBarProps
    ghost?: boolean
    params?: U
    columnsState?: ColumnStateType
    onSizeChange?: (size: DensitySize) => void
    cardProps?: ProCardProps | false
    tableRender?: (
      props: ProTableProps<DataSource, U, ValueType>,
      defaultDom: VNodeChild,
      domList: { toolbar?: VNodeChild, alert?: VNodeChild, table?: VNodeChild },
    ) => VNodeChild
    tableViewRender?: (props: TableProps<DataSource>, defaultDom: VNodeChild | (() => VNodeChild)) => VNodeChild | undefined
    tableExtraRender?: (props: ProTableProps<DataSource, U, ValueType>, dataSource: DataSource[]) => VNodeChild
    searchFormRender?: (props: ProTableProps<DataSource, U, ValueType>, defaultDom: VNodeChild) => VNodeChild
    request?: (
      params: U & { pageSize?: number, current?: number, keyword?: string },
      sort: Record<string, SortOrder>,
      filter: Record<string, FilterValue>,
    ) => Promise<Partial<RequestData<DataSource>> | null | undefined>
    postData?: (data: DataSource[]) => DataSource[]
    defaultData?: DataSource[]
    actionRef?: Ref<ActionType | undefined> | { current?: ActionType }
    formRef?: TableFormItem<DataSource>['formRef']
    toolBarRender?: ToolBarProps<DataSource>['toolBarRender'] | false
    optionsRender?: ToolBarProps<DataSource>['optionsRender']
    onLoad?: (dataSource: DataSource[], extra?: Record<string, any>) => void
    onLoadingChange?: (loading: boolean | SpinProps | undefined) => void
    onRequestError?: (e: Error) => void
    polling?: number | ((dataSource: DataSource[]) => number)
    tableClassName?: string
    tableStyle?: CSSProperties
    headerTitle?: VNodeChild
    tooltip?: string | LabelTooltipType
    options?: OptionConfig | false
    search?: false | SearchConfig
    form?: Omit<ProFormProps & QueryFilterProps, 'form'>
    dateFormatter?: string | number | false | ((value: any, valueType: string) => string | number)
    beforeSearchSubmit?: (params: Partial<U>) => any
    tableAlertRender?: AlertRenderType<DataSource>
    tableAlertOptionRender?: AlertRenderType<DataSource>
    rowSelection?: (TableProps<DataSource>['rowSelection'] & { alwaysShowAlert?: boolean }) | false
    type?: ProSchemaComponentTypes
    onSubmit?: (params: U) => void
    onReset?: () => void
    columnEmptyText?: ProFieldEmptyText
    manualRequest?: boolean
    editable?: RowEditableConfig<DataSource>
    onDataSourceChange?: (dataSource: DataSource[]) => void
    cardBordered?: Bordered
    debounceTime?: number
    revalidateOnFocus?: boolean
    defaultSize?: DensitySize
    name?: NamePath
    ErrorBoundary?: any | false
    onChange?: (...args: any[]) => void
  }

export type SearchConfig = false | {
  filterType?: 'query' | 'light'
  searchText?: string
  resetText?: string
  span?: number | Record<string, number>
  labelWidth?: number | 'auto'
  defaultCollapsed?: boolean
  collapsed?: boolean
  collapseRender?: false | ((collapsed: boolean, showCollapseButton?: boolean, hiddenNum?: false | number) => VNodeChild)
  optionRender?: false | ((searchConfig: any, props: any, dom: VNodeChild[]) => VNodeChild[])
  searchGutter?: number | [number, number]
  showHiddenNum?: boolean
  [key: string]: any
}

export type EditableFormInstance<T = any> = FormInstance & {
  getRowData?: (rowIndex: string | number) => T | undefined
  getRowsData?: () => T[] | undefined
  setRowData?: (rowIndex: string | number, data: Partial<T>) => void
}

export interface RecordCreatorProps<DataSourceType> {
  record: DataSourceType | ((index: number, dataSource: DataSourceType[]) => DataSourceType)
  position?: 'top' | 'bottom'
  newRecordType?: 'dataSource' | 'cache'
  parentKey?: RecordKey | ((index: number, dataSource: DataSourceType[]) => RecordKey)
  creatorButtonText?: VNodeChild
  [key: string]: any
}

export type EditableProTableProps<T = Record<string, any>, U = Record<string, any>, ValueType = 'text'>
  = Omit<ProTableProps<T, U, ValueType>, 'onChange'> & {
    defaultValue?: readonly T[]
    value?: readonly T[]
    onChange?: (value: T[]) => void
    onTableChange?: ProTableProps<T, U>['onChange']
    editableFormRef?: Ref<EditableFormInstance<T> | undefined> | { current?: EditableFormInstance<T> }
    recordCreatorProps?: (RecordCreatorProps<T> & { [key: string]: any }) | false
    maxLength?: number
    onValuesChange?: (values: T[], record: T) => void
    controlled?: boolean
    formItemProps?: any
  }

export interface OptionSearchProps {
  name?: string
  onSearch?: (keyword: string) => Promise<boolean | undefined> | boolean | undefined
  [key: string]: any
}
