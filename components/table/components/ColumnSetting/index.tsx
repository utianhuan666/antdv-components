import type { TableColumnType } from 'antdv-next'
import type { DataNode } from 'antdv-next/dist/tree'
import type { VNodeChild } from 'vue'
import type { ColumnsState } from '../../Store/Provide'
import type { ProColumns } from '../../typing'
import type { SettingOptionType } from '../ToolBar'
import {
  SettingOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@antdv-next/icons'
import { clsx, omit } from '@v-c/util'

import { Checkbox, Popover, Space, Tooltip, Tree, Typography } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useIntl, useProProviderContext } from '../../../provider'

import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { runFunction, useRefFunction } from '../../../utils'
import { useTableContext } from '../../Store/Provide'
import { genColumnKey } from '../../utils/index'
import { useStyle } from './style'

export type ColumnSettingProps<T = any> = SettingOptionType & {
  // `columns` 类型与 ToolBar 保持一致（TableColumnType<T> & { index? }），
  // 使用与 ToolBar 一致的类型，以便消费 index 等字段。
  columns: (TableColumnType<T> & { index?: number })[]
}

interface ToolTipIconProps {
  title: string
  columnKey: string | number
  show: boolean
  fixed?: 'left' | 'right'
}

interface CheckboxListItemProps {
  columnKey: string | number
  className?: string
  title?: VNodeChild
  fixed?: boolean | 'left' | 'right'
  showListItemOption?: boolean
  isLeaf?: boolean
}

interface CheckboxListProps {
  list: (ProColumns<any> & { index?: number })[]
  className?: string
  title: string
  draggable: boolean
  checkable: boolean
  showListItemOption: boolean
  showTitle?: boolean
  listHeight?: number
}

interface GroupCheckboxListProps {
  localColumns: (ProColumns<any> & { index?: number })[]
  className?: string
  draggable: boolean
  checkable: boolean
  showListItemOption: boolean
  listsHeight?: number
}

const ToolTipIcon = defineComponent<ToolTipIconProps>({
  name: 'ColumnSettingToolTipIcon',
  props: ['title', 'columnKey', 'show', 'fixed'],
  setup(rawProps, { slots }) {
    const props = rawProps
    const { columnsMap, setColumnsMap } = useTableContext()
    return () => {
      if (!props.show)
        return null
      return (
        <Tooltip title={props.title}>
          <span
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              const config = columnsMap?.[props.columnKey] || {}
              const columnKeyMap = {
                ...columnsMap,
                [props.columnKey]: { ...config, fixed: props.fixed } as ColumnsState,
              }
              setColumnsMap(columnKeyMap)
            }}
          >
            {slots.default?.()}
          </span>
        </Tooltip>
      )
    }
  },
})

const CheckboxListItem = defineComponent<CheckboxListItemProps>({
  name: 'ColumnSettingCheckboxListItem',
  props: ['columnKey', 'className', 'title', 'fixed', 'showListItemOption', 'isLeaf'],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const { hashId } = useProProviderContext()

    return () => {
      const { className, columnKey, fixed, isLeaf, showListItemOption, title } = props
      const dom = (
        <span class={clsx(`${className}-list-item-option`, hashId)}>
          <ToolTipIcon
            columnKey={columnKey}
            fixed="left"
            title={intl.getMessage('tableToolBar.leftPin', '固定在列首')}
            show={fixed !== 'left'}
          >
            <VerticalAlignTopOutlined />
          </ToolTipIcon>
          <ToolTipIcon
            columnKey={columnKey}
            fixed={undefined}
            title={intl.getMessage('tableToolBar.noPin', '不固定')}
            show={!!fixed}
          >
            <VerticalAlignMiddleOutlined />
          </ToolTipIcon>
          <ToolTipIcon
            columnKey={columnKey}
            fixed="right"
            title={intl.getMessage('tableToolBar.rightPin', '固定在列尾')}
            show={fixed !== 'right'}
          >
            <VerticalAlignBottomOutlined />
          </ToolTipIcon>
        </span>
      )
      return (
        <span class={clsx(`${className}-list-item`, hashId)} key={columnKey}>
          <div class={clsx(`${className}-list-item-title`, hashId)}>
            {title}
          </div>
          {showListItemOption && !isLeaf ? dom : null}
        </span>
      )
    }
  },
})

const CheckboxList = defineComponent<CheckboxListProps>({
  name: 'ColumnSettingCheckboxList',
  props: ['list', 'className', 'title', 'draggable', 'checkable', 'showListItemOption', 'showTitle', 'listHeight'],
  setup(rawProps) {
    const props = rawProps
    const { hashId } = useProProviderContext()

    const { columnsMap, setColumnsMap, sortKeyColumns, setSortKeyColumns } = useTableContext()
    const show = computed(() => props.list && props.list.length > 0)

    const treeDataConfig = computed(() => {
      if (!show.value)
        return {} as { list?: DataNode[], keys?: string[], map?: Map<string | number, DataNode & { parentKey?: string }> }
      const checkedKeys: string[] = []
      const treeMap = new Map<string | number, DataNode & { parentKey?: string }>()

      const loopData = (
        data: any[],
        parentConfig?: ColumnsState & { columnKey: string },
      ): DataNode[] =>
        data.map(({ key, dataIndex: _dataIndex, children, ...rest }) => {
          const columnKey = genColumnKey(
            key,
            [parentConfig?.columnKey, rest.index].filter(Boolean).join('-'),
          )
          const config = columnsMap?.[columnKey || 'null'] || { show: true }
          if (config.show !== false && !children)
            checkedKeys.push(columnKey)

          const item: DataNode = {
            key: columnKey,
            ...omit(rest, ['className']),
            selectable: false,
            disabled: config.disable === true,
            disableCheckbox:
              typeof config.disable === 'boolean'
                ? config.disable
                : config.disable?.checkbox,
            isLeaf: parentConfig ? true : undefined,
          }

          if (children) {
            item.children = loopData(children, {
              ...config,
              columnKey,
            })
            // 如果children 已经全部是show了，把自己也设置为show
            if (
              item.children?.every(childrenItem =>
                checkedKeys?.includes(childrenItem.key as string),
              )
            ) {
              checkedKeys.push(columnKey)
            }
          }
          // 必须用 columnKey（Tree 节点的 key）而非原始 column.key 存入 treeMap，
          // 否则 onCheckTree.loopSetShow 通过 e.node.key（= columnKey）查父子关系时
          // treeMap.get 永远返回 undefined，导致嵌套列的父子联动全部失效。
          treeMap.set(columnKey, { ...item, parentKey: parentConfig?.columnKey })
          return item
        })
      return { list: loopData(props.list), keys: checkedKeys, map: treeMap }
    })

    /** 移动到指定的位置 */
    const move = useRefFunction(
      (id: string | number, targetId: string | number, dropPosition: number) => {
        const newMap = { ...columnsMap }
        const newColumns = [...sortKeyColumns]
        const findIndex = newColumns.findIndex(columnKey => columnKey === id)
        const targetIndex = newColumns.findIndex(columnKey => columnKey === targetId)
        const isDownWard = dropPosition >= findIndex
        if (findIndex < 0)
          return
        const targetItem = newColumns[findIndex]
        newColumns.splice(findIndex, 1)

        if (dropPosition === 0) {
          newColumns.unshift(targetItem)
        }
        else {
          newColumns.splice(
            isDownWard ? targetIndex : targetIndex + 1,
            0,
            targetItem,
          )
        }
        // 重新生成排序数组
        newColumns.forEach((key, order) => {
          newMap[key] = { ...(newMap[key] || {}), order }
        })
        // 更新数组
        setColumnsMap(newMap)
        setSortKeyColumns(newColumns)
      },
    )

    /** 选中反选功能 */
    const onCheckTree = useRefFunction((e: { checked: boolean, node: { key: string | number } }) => {
      const newColumnMap = { ...columnsMap }
      const config = treeDataConfig.value

      const loopSetShow = (key: string | number) => {
        const newSetting = { ...newColumnMap[key] }
        newSetting.show = e.checked

        // 如果含有子节点，也要同步子节点状态
        if (config.map?.get(key)?.children) {
          config.map
            .get(key)
            ?.children
            ?.forEach(item => loopSetShow(item.key as string))
        }

        // 先写入当前节点，再检查父节点 —— 顺序至关重要：
        // 父节点逻辑需要读取兄弟节点的最新状态，当前节点必须先写入 newColumnMap，
        // 否则读到的仍是旧值，导致 allSiblingsUnchecked 判断出错。
        newColumnMap[key] = newSetting

        // 勾选方向：子节点选中时父节点自动设为 true
        // 取消方向：检查所有兄弟节点是否已全部取消，若是则父节点也取消
        const parentKey = config.map?.get(key)?.parentKey
        if (parentKey) {
          if (e.checked) {
            newColumnMap[parentKey] = { ...newColumnMap[parentKey], show: true }
          }
          else {
            const siblings = config.map?.get(parentKey)?.children ?? []
            const allSiblingsUnchecked = siblings.every((sibling) => {
              const siblingState = newColumnMap[sibling.key as string]
              return siblingState && siblingState.show === false
            })
            if (allSiblingsUnchecked) {
              newColumnMap[parentKey] = {
                ...newColumnMap[parentKey],
                show: false,
              }
            }
          }
        }
      }
      loopSetShow(e.node.key)
      setColumnsMap({ ...newColumnMap })
    })

    return () => {
      if (!show.value)
        return null

      const config = treeDataConfig.value
      const { className, checkable, draggable, showListItemOption, showTitle, title: listTitle, listHeight } = props

      const listDom = (
        <Tree
          itemHeight={24}
          draggable={
            draggable
            && !!config.list?.length
            && config.list?.length > 1
          }
          checkable={checkable}
          // antdv-next Tree 的 @drop 事件 payload 与 antd onDrop 一致：
          // { node, dragNode, dropPosition, dropToGap }，沿用同一套 reorder 数学。
          onDrop={(info: any) => {
            const dropKey = info.node.key
            const dragKey = info.dragNode.key
            const { dropPosition, dropToGap } = info
            const position
              = dropPosition === -1 || !dropToGap ? dropPosition + 1 : dropPosition
            move(dragKey, dropKey, position)
          }}
          blockNode
          // antdv-next Tree 的 @check 第二参为 CheckInfo（含 checked / node），
          // 与 antd 一致，直接转发给 onCheckTree。
          onCheck={(_: any, e: any) => onCheckTree(e)}
          checkedKeys={config.keys}
          showLine={false}
          titleRender={(_node: any) => {
            const node = { ..._node, children: undefined }
            if (!node.title)
              return null
            const normalizedTitle = runFunction(node.title, node)
            const wrappedTitle = (
              <Typography.Text
                style={{ width: '80px' }}
                ellipsis={{ tooltip: normalizedTitle }}
              >
                {normalizedTitle}
              </Typography.Text>
            )

            return (
              <CheckboxListItem
                className={className}
                {...omit(node, ['key'])}
                showListItemOption={showListItemOption}
                title={wrappedTitle}
                columnKey={node.key as string}
              />
            )
          }}
          height={listHeight}
          treeData={config.list?.map(
            ({
              disabled: _disabled /* 不透传 disabled，使子节点禁用时也可以拖动调整顺序 */,
              ...rest
            }) => rest,
          )}
        />
      )
      return (
        <>
          {showTitle && (
            <span class={clsx(`${className}-list-title`, hashId)}>
              {listTitle}
            </span>
          )}
          {listDom}
        </>
      )
    }
  },
})

const GroupCheckboxList = defineComponent<GroupCheckboxListProps>({
  name: 'ColumnSettingGroupCheckboxList',
  props: ['localColumns', 'className', 'draggable', 'checkable', 'showListItemOption', 'listsHeight'],
  setup(rawProps) {
    const props = rawProps
    const { hashId } = useProProviderContext()
    const intl = useIntl()

    return () => {
      const rightList: (ProColumns<any> & { index?: number })[] = []
      const leftList: (ProColumns<any> & { index?: number })[] = []
      const list: (ProColumns<any> & { index?: number })[] = []

      props.localColumns.forEach((item) => {
        /** 不在 setting 中展示的 */
        if (item.hideInSetting)
          return

        const { fixed } = item
        if (fixed === 'left') {
          leftList.push(item)
          return
        }
        if (fixed === 'right') {
          rightList.push(item)
          return
        }
        list.push(item)
      })

      const showRight = rightList && rightList.length > 0
      const showLeft = leftList && leftList.length > 0
      const { className, checkable, draggable, showListItemOption, listsHeight } = props
      return (
        <div
          class={clsx(`${className}-list`, hashId, {
            [`${className}-list-group`]: showRight || showLeft,
          })}
        >
          <CheckboxList
            title={intl.getMessage('tableToolBar.leftFixedTitle', '固定在左侧')}
            list={leftList}
            draggable={draggable}
            checkable={checkable}
            showListItemOption={showListItemOption}
            className={className}
            listHeight={listsHeight}
          />
          {/* 如果没有任何固定，不需要显示title */}
          <CheckboxList
            list={list}
            draggable={draggable}
            checkable={checkable}
            showListItemOption={showListItemOption}
            title={intl.getMessage('tableToolBar.noFixedTitle', '不固定')}
            showTitle={showLeft || showRight}
            className={className}
            listHeight={listsHeight}
          />
          <CheckboxList
            title={intl.getMessage('tableToolBar.rightFixedTitle', '固定在右侧')}
            list={rightList}
            draggable={draggable}
            checkable={checkable}
            showListItemOption={showListItemOption}
            className={className}
            listHeight={listsHeight}
          />
        </div>
      )
    }
  },
})

const ColumnSetting = defineComponent<ColumnSettingProps<any>>({
  name: 'ColumnSetting',
  props: ['columns', 'draggable', 'checkable', 'showListItemOption', 'checkedReset', 'listsHeight', 'extra', 'settingIcon'],
  setup(rawProps, { slots }) {
    const props = rawProps
    // 获得当前上下文
    const counter = useTableContext()

    const localColumns = computed(() => props.columns as (TableColumnType<any> & {
      index?: number
      fixed?: any
      key?: any
    })[])

    const { columnsMap, setColumnsMap, clearPersistenceStorage } = counter

    /**
     * 设置全部选中，或全部未选中
     */
    const setAllSelectAction = useRefFunction((show: boolean = true) => {
      const columnKeyMap = {} as Record<string, any>
      const loopColumns = (columns: any) => {
        columns.forEach(({ key, fixed, index, children, disable }: any) => {
          const columnKey = genColumnKey(key, index)
          if (columnKey) {
            columnKeyMap[columnKey] = {
              // 子节点 disable 时，不修改节点显示状态
              show: disable ? columnsMap?.[columnKey]?.show : show,
              fixed,
              disable,
              order: columnsMap?.[columnKey]?.order,
            }
          }
          if (children)
            loopColumns(children)
        })
      }
      loopColumns(localColumns.value)
      setColumnsMap(columnKeyMap)
    })

    /** 全选和反选 */
    const checkedAll = useRefFunction((e: any) => {
      if (e.target.checked)
        setAllSelectAction()
      else
        setAllSelectAction(false)
    })

    /** 重置项目 */
    const clearClick = useRefFunction(() => {
      clearPersistenceStorage?.()
      // 直接从 propsRef 读取最新 columnsState.value，消除 mount-only 缓存的 stale 问题。
      setColumnsMap(
        counter.propsRef.value?.columnsState?.defaultValue
        || counter.propsRef.value?.columnsState?.value
        || counter.defaultColumnKeyMap!,
      )
    })

    // 未选中的 key 列表 —— 从 localColumns（当前可见列）派生，而非从 columnsMap 全量派生。
    const unCheckedKeys = computed(() => {
      return localColumns.value.filter(({ key, dataIndex }: any, index: number) => {
        const columnKey = genColumnKey(key ?? (dataIndex as string), index)
        const state = columnsMap?.[columnKey]
        return state && state.show === false
      })
    })

    // 是否全部列都已选中
    const allChecked = computed(() => unCheckedKeys.value.length === 0 && localColumns.value.length > 0)

    // 是否部分选中（indeterminate）
    const indeterminate = computed(() =>
      unCheckedKeys.value.length > 0 && unCheckedKeys.value.length < localColumns.value.length,
    )

    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-table-column-setting')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const className = prefixCls.value
      return wrapSSR(
        <Popover
          arrow={false}
          title={(
            <div class={clsx(`${className}-title`, hashId)}>
              {props.checkable === false
                ? (
                    <div />
                  )
                : (
                    <Checkbox
                      indeterminate={indeterminate.value}
                      checked={allChecked.value}
                      onChange={(e: any) => {
                        checkedAll(e)
                      }}
                    >
                      {intl.getMessage('tableToolBar.columnDisplay', '列展示')}
                    </Checkbox>
                  )}
              {props.checkedReset
                ? (
                    <a
                      onClick={clearClick}
                      class={clsx(`${className}-action-rest-button`, hashId)}
                    >
                      {intl.getMessage('tableToolBar.reset', '重置')}
                    </a>
                  )
                : null}
              {props?.extra
                ? (
                    <Space size={12} align="center">
                      {props.extra}
                    </Space>
                  )
                : null}
            </div>
          )}
          classNames={{
            root: clsx(`${className}-overlay`, hashId),
          }}
          trigger="click"
          placement="bottomRight"
          content={(
            <GroupCheckboxList
              checkable={props.checkable ?? true}
              draggable={props.draggable ?? true}
              showListItemOption={props.showListItemOption ?? true}
              className={className}
              localColumns={localColumns.value as any}
              listsHeight={props.listsHeight}
            />
          )}
        >
          {slots.default?.() || (
            <Tooltip
              title={intl.getMessage('tableToolBar.columnSetting', '列设置')}
            >
              {props.settingIcon ?? <SettingOutlined />}
            </Tooltip>
          )}
        </Popover>,
      )
    }
  },
})

export default ColumnSetting
export { ColumnSetting }
