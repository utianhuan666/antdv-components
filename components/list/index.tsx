import type { App, HTMLAttributes, VNodeChild } from 'vue'
import type { CheckCardProps } from '../card'
import type {
  ActionType,
  ProColumns,
  ProColumnType,
  ProTableProps,
} from '../table'
import type {
  LabelTooltipType,
  ProFieldValueType,
} from '../utils'
import type { ProListSlot } from './constants'
import type { ItemProps } from './Item'
import type { ProListItemRender } from './ListView'
import type { ListProps } from './ProListBase'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef, watchEffect } from 'vue'
import { ProConfigProvider } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import ProTable from '../table'
import { setActionRef } from '../table/useFetchData'
import { useRefFunction } from '../utils'
import ListView from './ListView'
import { useStyle } from './style'

export type ProListMeta<T> = Pick<
  ProColumnType<T>,
  | 'dataIndex'
  | 'valueType'
  | 'render'
  | 'search'
  | 'title'
  | 'valueEnum'
  | 'editable'
  | 'fieldProps'
  | 'formItemProps'
  | 'formItemRender'
> & {
  key?: string | number
}

type ProListMetaAction<T> = ProListMeta<T>

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N
type IsAny<T> = IfAny<T, true, false>

export interface BaseProListMetas<T = any> {
  [key: string]: any
  type?: ProListMeta<T>
  title?: ProListMeta<T>
  subTitle?: ProListMeta<T>
  description?: ProListMeta<T>
  avatar?: ProListMeta<T>
  content?: ProListMeta<T>
  actions?: ProListMetaAction<T>
}

/**
 * @deprecated Use columns + listSlot to share the ProTable column API.
 */
export type ProListMetas<T = any> = BaseProListMetas<T> & {
  [key in keyof T]?: IsAny<T> extends true
    ? ProListMetaAction<T>
    : ProListMeta<T>
}

export type GetComponentProps<RecordType> = (
  record: RecordType,
  index: number,
) => HTMLAttributes

export type ProListProps<
  RecordType = any,
  Params = Record<string, any>,
  ValueType = 'text',
> = Omit<ProTableProps<RecordType, Params, ValueType>, 'size' | 'footer'>
  & Omit<ListProps<RecordType>, 'rowKey'> & {
    tooltip?: LabelTooltipType | string
    /**
     * @deprecated Use columns + listSlot to share the ProTable column API.
     */
    metas?: ProListMetas<RecordType>
    onRow?: GetComponentProps<RecordType>
    onItem?: GetComponentProps<RecordType>
    itemCardProps?: CheckCardProps
    rowClassName?: string | ((item: RecordType, index: number) => string)
    itemHeaderRender?: ItemProps<RecordType>['itemHeaderRender']
    itemTitleRender?: ItemProps<RecordType>['itemTitleRender']
    itemRender?: ProListItemRender<RecordType>
  }

export type Key = string | number

export type TriggerEventHandler<RecordType> = (record: RecordType) => void

const DEFAULT_VALUE_TYPE_MAP: Record<string, ProFieldValueType> = {
  avatar: 'avatar',
  actions: 'option',
  description: 'textarea',
}

function metasToColumns<RecordType>(
  metas: ProListMetas<RecordType>,
): ProColumnType<RecordType>[] {
  return Object.keys(metas).map((key) => {
    const meta = metas[key] || {}
    const valueType = meta.valueType || DEFAULT_VALUE_TYPE_MAP[key]
    return {
      listSlot: key as ProListSlot,
      dataIndex: meta.dataIndex || key,
      ...meta,
      valueType,
    }
  })
}

function enrichColumnsWithDefaults<RecordType>(
  columns: ProColumns<RecordType>[],
): ProColumnType<RecordType>[] {
  return columns.map((col) => {
    const { listSlot } = col
    if (!listSlot)
      return col
    const valueType = col.valueType || DEFAULT_VALUE_TYPE_MAP[listSlot]
    return valueType ? { ...col, valueType } : col
  })
}

let metasWarningShown = false

function warningDeprecatedMetas() {
  if (metasWarningShown)
    return
  metasWarningShown = true

  const env = (globalThis as any).process?.env?.NODE_ENV
  if (env !== 'production') {
    console.warn(
      '[ProList] `metas` is deprecated. Please use `columns` with `listSlot` instead. '
      + 'See: columns={[ { dataIndex: "name", listSlot: "title" } ]}',
    )
  }
}

const proListPropNames = [
  'metas',
  'columns',
  'split',
  'variant',
  'footer',
  'rowKey',
  'tooltip',
  'className',
  'options',
  'search',
  'expandable',
  'rowSelection',
  'pagination',
  'itemLayout',
  'itemRender',
  'grid',
  'itemCardProps',
  'onRow',
  'onItem',
  'rowClassName',
  'locale',
  'itemHeaderRender',
  'itemTitleRender',
  'prefixCls',
  'actionRef',
]

const InternalProList = defineComponent<ProListProps>({
  name: 'InternalProList',
  inheritAttrs: false,
  props: proListPropNames,
  setup(rawProps, { attrs }) {
    const props = rawProps
    const actionRef = shallowRef<ActionType>()

    watchEffect(() => {
      setActionRef(props.actionRef, actionRef.value)
    })

    if (props.metas)
      warningDeprecatedMetas()

    const proTableColumns = computed((): ProColumnType<Record<string, any>>[] => {
      if (props.columns && props.columns.length > 0)
        return enrichColumnsWithDefaults<Record<string, any>>(props.columns as ProColumns<Record<string, any>>[])
      if (!props.metas)
        return []
      return metasToColumns<Record<string, any>>(props.metas)
    })

    const prefixCls = useProPrefixCls('pro-list', computed(() => props.prefixCls))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const listClassName = computed(() => clsx(prefixCls.value, hashId, {
      [`${prefixCls.value}-no-split`]: !props.split,
      [`${prefixCls.value}-${props.variant}`]: props.variant,
    }))

    const renderListTableView = useRefFunction(({
      columns,
      size,
      pagination,
      rowSelection,
      dataSource,
      loading,
    }: Parameters<NonNullable<ProTableProps<Record<string, any>, Record<string, any>>['tableViewRender']>>[0]) => (
      <ListView
        grid={props.grid}
        itemCardProps={props.itemCardProps}
        itemTitleRender={props.itemTitleRender}
        prefixCls={props.prefixCls}
        columns={columns}
        itemRender={props.itemRender}
        actionRef={actionRef}
        dataSource={(dataSource || []) as Record<string, any>[]}
        size={size as any}
        footer={props.footer as VNodeChild}
        split={props.split}
        variant={props.variant}
        rowKey={props.rowKey}
        expandable={props.expandable}
        rowSelection={props.rowSelection === false ? undefined : rowSelection}
        pagination={pagination as any}
        itemLayout={props.itemLayout}
        loading={loading}
        itemHeaderRender={props.itemHeaderRender}
        onRow={props.onRow}
        onItem={props.onItem}
        rowClassName={props.rowClassName}
        locale={props.locale}
        hashId={hashId}
      />
    ))

    return () => {
      const options = props.options === undefined ? false : props.options
      const search = props.search === undefined ? false : props.search
      const rowSelection = props.rowSelection === undefined ? false : props.rowSelection
      const pagination = props.pagination === undefined ? false : props.pagination
      const tableAttrs = attrs as Record<string, any>

      return wrapSSR(
        <ProTable
          {...tableAttrs}
          tooltip={props.tooltip}
          actionRef={actionRef}
          pagination={pagination}
          type="list"
          rowSelection={rowSelection}
          search={search}
          options={options}
          className={clsx(tableAttrs.class, props.className, listClassName.value)}
          columns={proTableColumns.value}
          rowKey={props.rowKey as any}
          tableViewRender={renderListTableView}
        />,
      )
    }
  },
})

const InternalProListComponent = InternalProList as any

const BaseProListImpl = defineComponent({
  name: 'BaseProList',
  inheritAttrs: false,
  props: proListPropNames,
  setup(props, { attrs }) {
    return () => (
      <ProConfigProvider needDeps>
        <InternalProListComponent
          {...attrs}
          {...props}
          cardProps={false}
          search={false}
          toolBarRender={false}
        />
      </ProConfigProvider>
    )
  },
})

const ProListImpl = defineComponent({
  name: 'ProList',
  inheritAttrs: false,
  props: proListPropNames,
  setup(props, { attrs }) {
    return () => (
      <ProConfigProvider needDeps>
        <InternalProList {...attrs} {...props} />
      </ProConfigProvider>
    )
  },
})

const BaseProList = BaseProListImpl as typeof BaseProListImpl & {
  new(): { $props: ProListProps<any, any, any> }
}

const ProList = ProListImpl as typeof ProListImpl & {
  new(): { $props: ProListProps<any, any, any> }
}

const ListModule = {
  install(app: App) {
    app.component(ProList.name!, ProList)
    app.component(BaseProList.name!, BaseProList)
  },
}

export type { ProListItemRender } from './ListView'

export { BaseProList, ListModule, ProList }

export default ProList
