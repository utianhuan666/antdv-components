import type {
  TableColumnType,
  TablePaginationConfig,
  TableProps,
  TableRowSelection,
} from 'antdv-next'
import type { Ref, VNode, VNodeChild } from 'vue'
import type { CheckCardProps } from '../card'
import type { ActionType } from '../table'
import type { ItemProps } from './Item'
import type { ListProps } from './ProListBase'
import { clsx } from '@v-c/util'
import { computed, defineComponent, isVNode, ref } from 'vue'
import { useProProviderContext } from '../provider'
import { useProPrefixCls } from '../provider/useProPrefixCls'
import { getValueByNamePath, useRefFunction } from '../utils'
import useLazyKVMap from '../utils/useLazyKVMap'
import usePagination from '../utils/usePagination'
import useSelection from '../utils/useSelection'
import { PRO_LIST_KEYS_MAP } from './constants'
import ProListItem from './Item'
import { ProListContainer } from './ProListBase'

type Key = string | number
type GetRowKey<RecordType> = (record: RecordType, index?: number) => Key

type ListSlotColumn<RecordType> = TableColumnType<RecordType> & {
  listSlot: string
  render?: (value: any, record: RecordType, index: number) => VNodeChild
}

export type GetComponentProps<RecordType> = (
  record: RecordType,
  index: number,
) => Record<string, any>

export type ProListItemRender<RecordType> = (
  item: RecordType,
  index: number,
  defaultDom: VNode,
) => VNodeChild

export type ListViewProps<RecordType> = Omit<
  ListProps<RecordType>,
  'rowKey' | 'renderItem'
>
& Pick<
  TableProps<RecordType>,
  'columns' | 'dataSource' | 'expandable' | 'pagination'
> & {
  rowKey?: string | keyof RecordType | GetRowKey<RecordType>
  rowSelection?: TableRowSelection<RecordType>
  prefixCls?: string
  dataSource: readonly RecordType[]
  itemRender?: ProListItemRender<RecordType>
  actionRef?: Ref<ActionType | undefined> | { current?: ActionType }
  onRow?: GetComponentProps<RecordType>
  onItem?: GetComponentProps<RecordType>
  rowClassName?: string | ((item: RecordType, index: number) => string)
  itemHeaderRender?: ItemProps<RecordType>['itemHeaderRender']
  itemTitleRender?: ItemProps<RecordType>['itemTitleRender']
  itemCardProps?: CheckCardProps
  pagination?: TablePaginationConfig | false
  hashId?: string
}

function getRefCurrent<T>(target: Ref<T | undefined> | { current?: T } | undefined): T | undefined {
  if (!target)
    return undefined
  return 'value' in target ? target.value : target.current
}

function getRestListProps(props: Record<string, any>) {
  const {
    dataSource: _dataSource,
    columns: _columns,
    rowKey: _rowKey,
    prefixCls: _prefixCls,
    actionRef: _actionRef,
    itemTitleRender: _itemTitleRender,
    itemRender: _itemRender,
    itemCardProps: _itemCardProps,
    itemHeaderRender: _itemHeaderRender,
    expandable: _expandable,
    rowSelection: _rowSelection,
    pagination: _pagination,
    onRow: _onRow,
    onItem: _onItem,
    rowClassName: _rowClassName,
    hashId: _hashId,
    ...rest
  } = props

  return rest
}

function isRenderedCell(value: unknown): value is { children?: VNodeChild } {
  return !!value && typeof value === 'object' && !isVNode(value) && ('children' in value || 'props' in value)
}

const ListViewImpl = defineComponent({
  name: 'ProListView',
  inheritAttrs: false,
  props: [
    'dataSource',
    'columns',
    'rowKey',
    'prefixCls',
    'actionRef',
    'itemTitleRender',
    'itemRender',
    'itemCardProps',
    'itemHeaderRender',
    'expandable',
    'rowSelection',
    'pagination',
    'onRow',
    'onItem',
    'rowClassName',
    'hashId',
    'variant',
    'className',
    'rootClassName',
    'style',
    'children',
    'extra',
    'grid',
    'id',
    'itemLayout',
    'loading',
    'loadMore',
    'size',
    'split',
    'header',
    'footer',
    'locale',
  ],
  setup(rawProps, { attrs }) {
    const props = rawProps as ListViewProps<Record<string, any>>
    const context = useProProviderContext()
    const hashId = computed(() => props.hashId ?? context.hashId)
    const prefixCls = useProPrefixCls('pro-list', computed(() => props.prefixCls))
    const containerPrefixCls = useProPrefixCls('pro-list-container', computed(() => props.prefixCls))
    const dataSource = computed(() => (props.dataSource || []) as readonly Record<string, any>[])

    const getRowKey = computed<GetRowKey<Record<string, any>>>(() => {
      if (typeof props.rowKey === 'function')
        return props.rowKey as GetRowKey<Record<string, any>>

      return (record: Record<string, any>, index?: number) =>
        record?.[props.rowKey as string] || index || 0
    })

    const getRecordByKeyCache = computed(() => {
      const [getRecordByKey] = useLazyKVMap(
        dataSource.value,
        'children',
        getRowKey.value,
      )
      return getRecordByKey
    })
    const getRecordByKey = (key: Key) => getRecordByKeyCache.value(key)

    const listSlotColumns = computed<ListSlotColumn<Record<string, any>>[]>(() => {
      if (!props.columns?.length)
        return []

      const slots: ListSlotColumn<Record<string, any>>[] = []
      ;(props.columns as Array<TableColumnType<Record<string, any>> & { listSlot?: string }>).forEach((column) => {
        const { listSlot } = column
        if (listSlot && PRO_LIST_KEYS_MAP.has(listSlot))
          slots.push(column as ListSlotColumn<Record<string, any>>)
      })
      return slots
    })

    const gridCardStaticProps = computed(() => {
      if (!props.grid)
        return undefined
      return { ...props.itemCardProps, ...props.grid }
    })

    const [mergedPagination] = usePagination(
      dataSource.value.length,
      () => {},
      props.pagination as TablePaginationConfig | false,
    )

    const mergedPaginationConfig = computed<TablePaginationConfig>(() => {
      const pagination = props.pagination
      const paginationTotal = pagination && typeof pagination === 'object'
        ? pagination.total
        : undefined
      return {
        ...mergedPagination.value,
        total: paginationTotal && paginationTotal > 0
          ? paginationTotal
          : dataSource.value.length,
      }
    })

    const pageData = computed<readonly Record<string, any>[]>(() => {
      const pagination = props.pagination
      const merged = mergedPaginationConfig.value

      if (
        pagination === false
        || !merged.pageSize
        || dataSource.value.length < (merged.total || 0)
      ) {
        return dataSource.value
      }

      const current = merged.current || 1
      const pageSize = merged.pageSize || 10

      return dataSource.value.slice((current - 1) * pageSize, current * pageSize)
    })

    const [selectItemRender, selectedKeySet] = useSelection(
      {
        get getRowKey() {
          return getRowKey.value
        },
        getRecordByKey,
        get prefixCls() {
          return prefixCls.value
        },
        get data() {
          return dataSource.value as Record<string, any>[]
        },
        get pageData() {
          return pageData.value as Record<string, any>[]
        },
        expandType: 'row',
        childrenColumnName: 'children',
        locale: {},
      } as any,
      props.rowSelection as TableRowSelection<Record<string, any>> | undefined,
    )

    const getDefaultExpandedKeys = () => {
      const expandableConfig = props.expandable as any
      if (expandableConfig?.defaultExpandedRowKeys)
        return expandableConfig.defaultExpandedRowKeys as Key[]
      if (expandableConfig?.defaultExpandAllRows !== false)
        return dataSource.value.map((item, index) => getRowKey.value(item, index))
      return []
    }

    const innerExpandedKeys = ref<Key[]>(getDefaultExpandedKeys())

    const mergedExpandedKeys = computed(() => {
      const expandableConfig = props.expandable as any
      return new Set<Key>(expandableConfig?.expandedRowKeys || innerExpandedKeys.value || [])
    })

    const onTriggerExpand = useRefFunction((record: Record<string, any>, rowIndex: number) => {
      const expandableConfig = props.expandable as any
      const key = getRowKey.value(record, rowIndex)
      const hasKey = mergedExpandedKeys.value.has(key)
      const nextKeys = new Set(mergedExpandedKeys.value)
      if (hasKey)
        nextKeys.delete(key)
      else
        nextKeys.add(key)

      const newExpandedKeys = Array.from(nextKeys)
      innerExpandedKeys.value = newExpandedKeys
      expandableConfig?.onExpand?.(!hasKey, record)
      expandableConfig?.onExpandedRowsChange?.(newExpandedKeys)
    })

    const renderListItem = useRefFunction((item: Record<string, any>, index: number) => {
      const listItemProps: Partial<ItemProps<Record<string, any>>> = {
        className: typeof props.rowClassName === 'function'
          ? props.rowClassName(item, index)
          : props.rowClassName,
      }

      listSlotColumns.value.forEach((column) => {
        const dataIndex = (column.dataIndex || column.listSlot || column.key) as any
        const rawData = Array.isArray(dataIndex)
          ? getValueByNamePath(item, dataIndex)
          : item[dataIndex]

        const customRender = (column as any).customRender
        const renderedData = column.render
          ? column.render(rawData, item, index)
          : typeof customRender === 'function'
            ? customRender({ text: rawData, value: rawData, record: item, index, column })
            : rawData
        const data = isRenderedCell(renderedData) ? renderedData.children : renderedData
        const propKey = column.listSlot === 'aside' ? 'extra' : column.listSlot
        if (data !== '-')
          (listItemProps as any)[propKey] = data
      })

      const checkboxColumn = selectItemRender([])[0]
      const checkboxDom = checkboxColumn?.render?.(item, item, index) as VNodeChild
      const editableInfo = getRefCurrent(props.actionRef)?.isEditable?.({ ...item, index } as any) as any
      const isEditable = typeof editableInfo === 'boolean'
        ? editableInfo
        : editableInfo?.isEditable
      const recordKey = typeof editableInfo === 'object'
        ? editableInfo?.recordKey
        : undefined
      const itemKey = getRowKey.value(item, index)
      const isChecked = selectedKeySet.value.has(itemKey)
      const checkboxOnChange = isVNode(checkboxDom)
        ? (checkboxDom as VNode).props?.onChange as ((event: any) => void) | undefined
        : undefined

      const cardProps = gridCardStaticProps.value
        ? {
            ...gridCardStaticProps.value,
            checked: isChecked,
            onChange: checkboxOnChange
              ? (changeChecked: boolean) => checkboxOnChange({
                  nativeEvent: {},
                  target: { checked: changeChecked },
                  changeChecked,
                })
              : undefined,
          }
        : undefined

      const defaultDom = (
        <ProListItem
          key={recordKey}
          cardProps={cardProps}
          {...listItemProps}
          recordKey={recordKey}
          isEditable={isEditable || false}
          expandable={props.expandable}
          expand={mergedExpandedKeys.value.has(itemKey)}
          onExpand={() => onTriggerExpand(item, index)}
          index={index}
          record={item}
          item={item}
          itemTitleRender={props.itemTitleRender}
          itemHeaderRender={props.itemHeaderRender}
          rowSupportExpand={!((props.expandable as any)?.rowExpandable) || (props.expandable as any).rowExpandable(item)}
          selected={selectedKeySet.value.has(itemKey)}
          checkbox={checkboxDom}
          onRow={props.onRow}
          onItem={props.onItem}
        />
      )

      return props.itemRender
        ? props.itemRender(item, index, defaultDom)
        : defaultDom
    })

    return () => {
      const rest = getRestListProps(rawProps as Record<string, any>)
      return (
        <ProListContainer
          {...attrs}
          {...rest}
          hashId={hashId.value}
          className={clsx(
            containerPrefixCls.value,
            hashId.value,
            rest.className,
          )}
          dataSource={dataSource.value as Record<string, any>[]}
          pagination={
            props.pagination
              ? mergedPaginationConfig.value as any
              : false
          }
          renderItem={renderListItem}
        />
      )
    }
  },
})

const ListView = ListViewImpl as typeof ListViewImpl & {
  new<RecordType extends Record<string, any> = Record<string, any>>(): {
    $props: ListViewProps<RecordType>
  }
}

export default ListView
