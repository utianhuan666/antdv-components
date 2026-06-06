import type { VNodeChild } from 'vue'
import type { ColumnsState } from '../../Store/Provide'
import type { ProColumns } from '../../typing'
import {
  SettingOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@antdv-next/icons'
import { Checkbox, Space, Tooltip, Typography } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { runFunction } from '../../../utils'
import { useTableContext } from '../../Store/Provide'
import { genColumnKey } from '../../utils'
import useStyle from './style'

type ColumnNode = Omit<ProColumns, 'children' | 'fixed'> & {
  index?: number
  parentKey?: string
  columnKey: string
  fixed?: 'left' | 'right'
  titleNode?: VNodeChild
  children?: ColumnNode[]
}

function getColumnKey(column: any, index: number | string, parentKey?: string) {
  return genColumnKey(column.key ?? column.dataIndex, parentKey ? `${parentKey}-${index}` : index)
}

function getColumnTitle(column: any): VNodeChild {
  if (typeof column.title === 'function')
    return column.title(column, 'table', null)
  return column.title
}

function getDisableConfig(state?: ColumnsState) {
  const disable = state?.disable
  return {
    disabled: disable === true,
    checkboxDisabled: disable === true || (typeof disable === 'object' && disable.checkbox),
  }
}

function normalizeFixed(fixed: any): 'left' | 'right' | undefined {
  return fixed === 'left' || fixed === 'right' ? fixed : undefined
}

function buildTree(columns: any[] = [], columnsMap: Record<string, ColumnsState>, parentKey?: string): ColumnNode[] {
  return columns
    .filter(column => column && !column.hideInSetting)
    .map((column, index) => {
      const columnKey = getColumnKey(column, column.index ?? index, parentKey)
      const state = columnsMap[columnKey]
      const children = column.children ? buildTree(column.children, columnsMap, columnKey) : undefined
      return {
        ...column,
        columnKey,
        parentKey,
        fixed: state?.fixed ?? normalizeFixed(column.fixed),
        titleNode: getColumnTitle(column),
        children,
      }
    })
}

function flattenTree(tree: ColumnNode[]): ColumnNode[] {
  return tree.flatMap(node => node.children?.length ? [node, ...flattenTree(node.children)] : [node])
}

export default defineComponent({
  name: 'ColumnSetting',
  props: [
    'columns',
    'draggable',
    'checkable',
    'showListItemOption',
    'checkedReset',
    'listsHeight',
    'extra',
    'children',
    'settingIcon',
  ],
  setup(props, { slots }) {
    const intl = useIntl()
    const counter = useTableContext()
    const open = ref(false)
    const expandedKeys = ref<Set<string>>(new Set())
    const draggingKey = ref<string>()
    const prefixCls = useProPrefixCls('pro-table-column-setting')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    const columnsMap = computed(() => counter?.columnsMap.value || {})
    const settingColumns = computed(() => {
      const propsColumns = counter?.propsRef.value?.columns
      return Array.isArray(propsColumns) && propsColumns.length ? propsColumns : (props.columns || [])
    })
    const localColumns = computed(() => buildTree(settingColumns.value, columnsMap.value))
    const flatColumns = computed(() => flattenTree(localColumns.value))

    function setColumnsMap(value: Record<string, ColumnsState>) {
      counter?.setColumnsMap(value)
    }

    function setColumnShow(columnKey: string, show: boolean) {
      const map = { ...columnsMap.value }
      const treeMap = new Map(flatColumns.value.map(node => [node.columnKey, node]))

      const loopSetShow = (key: string) => {
        const node = treeMap.get(key)
        const current = map[key] || {}
        const disable = getDisableConfig(current)
        map[key] = {
          ...current,
          show: disable.checkboxDisabled ? current.show : show,
        }

        node?.children?.forEach(child => loopSetShow(child.columnKey))

        if (node?.parentKey) {
          if (show) {
            map[node.parentKey] = { ...(map[node.parentKey] || {}), show: true }
            return
          }

          const parent = treeMap.get(node.parentKey)
          const allSiblingsUnchecked = (parent?.children || []).every((child) => {
            const state = map[child.columnKey]
            return state && state.show === false
          })
          if (allSiblingsUnchecked)
            map[node.parentKey] = { ...(map[node.parentKey] || {}), show: false }
        }
      }

      loopSetShow(columnKey)
      setColumnsMap(map)
    }

    function setColumnFixed(columnKey: string, fixed?: 'left' | 'right') {
      setColumnsMap({
        ...columnsMap.value,
        [columnKey]: {
          ...(columnsMap.value[columnKey] || {}),
          fixed,
        },
      })
    }

    function setAllSelectAction(show = true) {
      const map = { ...columnsMap.value }
      const loop = (nodes: ColumnNode[]) => {
        nodes.forEach((node) => {
          const current = map[node.columnKey] || {}
          const disable = getDisableConfig(current)
          map[node.columnKey] = {
            ...current,
            show: disable.checkboxDisabled ? current.show : show,
            fixed: current.fixed ?? node.fixed,
            disable: current.disable ?? node.disable,
            order: current.order,
          }
          if (node.children?.length)
            loop(node.children)
        })
      }
      loop(localColumns.value)
      setColumnsMap(map)
    }

    function clearClick() {
      counter?.clearPersistenceStorage()
      const propsRef = counter?.propsRef.value || {}
      if (propsRef.columnsState?.value && propsRef.columnsState?.defaultValue)
        counter?.setColumnsMap(propsRef.columnsState.value)
      counter?.setColumnsMap(
        propsRef.columnsState?.defaultValue
        || propsRef.columnsState?.value
        || counter.defaultColumnKeyMap.value,
      )
    }

    function getNodeState(node: ColumnNode): 'checked' | 'unchecked' | 'indeterminate' {
      if (node.children?.length) {
        const states = node.children.map(getNodeState)
        if (states.every(state => state === 'checked'))
          return 'checked'
        if (states.every(state => state === 'unchecked'))
          return columnsMap.value[node.columnKey]?.show === false ? 'unchecked' : 'indeterminate'
        return 'indeterminate'
      }
      return columnsMap.value[node.columnKey]?.show === false ? 'unchecked' : 'checked'
    }

    const allChecked = computed(() => flatColumns.value.length > 0 && flatColumns.value.every(node => getNodeState(node) === 'checked'))
    const indeterminate = computed(() => !allChecked.value && flatColumns.value.some(node => getNodeState(node) !== 'unchecked'))

    function moveColumn(dragKey?: string, targetKey?: string, dropPosition = 1) {
      if (!dragKey || !targetKey || dragKey === targetKey)
        return
      const keys = counter?.sortKeyColumns.value?.length
        ? [...counter.sortKeyColumns.value]
        : flatColumns.value.map(node => node.columnKey)
      const fromIndex = keys.indexOf(dragKey)
      const toIndex = keys.indexOf(targetKey)
      if (fromIndex < 0 || toIndex < 0)
        return

      const [item] = keys.splice(fromIndex, 1)
      if (item === undefined)
        return
      const insertIndex = dropPosition <= 0 ? toIndex : toIndex + (fromIndex < toIndex ? 0 : 1)
      keys.splice(Math.max(0, insertIndex), 0, item)
      const nextMap = { ...columnsMap.value }
      keys.forEach((key, order) => {
        nextMap[key] = { ...(nextMap[key] || {}), order }
      })
      counter?.setSortKeyColumns(keys)
      setColumnsMap(nextMap)
    }

    function renderPinAction(node: ColumnNode) {
      const fixed = columnsMap.value[node.columnKey]?.fixed ?? node.fixed
      const showListItemOption = props.showListItemOption ?? true
      if (!showListItemOption || node.parentKey)
        return null

      const iconProps = [
        {
          fixed: 'left' as const,
          title: intl.getMessage('tableToolBar.leftPin', '固定在列首'),
          show: fixed !== 'left',
          icon: <VerticalAlignTopOutlined />,
        },
        {
          fixed: undefined,
          title: intl.getMessage('tableToolBar.noPin', '不固定'),
          show: !!fixed,
          icon: <VerticalAlignMiddleOutlined />,
        },
        {
          fixed: 'right' as const,
          title: intl.getMessage('tableToolBar.rightPin', '固定在列尾'),
          show: fixed !== 'right',
          icon: <VerticalAlignBottomOutlined />,
        },
      ]

      return (
        <span class={[`${prefixCls.value}-list-item-option`, hashId]}>
          {iconProps.map(item => item.show
            ? (
                <Tooltip key={item.title} title={item.title}>
                  <span
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation()
                      event.preventDefault()
                      setColumnFixed(node.columnKey, item.fixed)
                    }}
                  >
                    {item.icon}
                  </span>
                </Tooltip>
              )
            : null)}
        </span>
      )
    }

    function renderTreeNode(node: ColumnNode, level = 0): VNodeChild {
      const state = getNodeState(node)
      const disable = getDisableConfig(columnsMap.value[node.columnKey])
      const expanded = expandedKeys.value.has(node.columnKey)
      const hasChildren = !!node.children?.length
      const checkable = props.checkable !== false

      return (
        <>
          <div
            key={node.columnKey}
            class={[
              'ant-tree-treenode',
              'ant-tree-treenode-switcher-open',
              disable.disabled ? 'ant-tree-treenode-disabled' : undefined,
            ]}
            draggable={(props.draggable ?? true) && flatColumns.value.length > 1}
          >
            <span
              class={['ant-tree-indent']}
              style={{ display: 'inline-block', width: `${level * 24}px` }}
            />
            <span
              class={['ant-tree-switcher', hasChildren ? 'ant-tree-switcher_open' : 'ant-tree-switcher-noop']}
              onClick={(event: MouseEvent) => {
                event.stopPropagation()
                if (!hasChildren)
                  return
                const next = new Set(expandedKeys.value)
                if (next.has(node.columnKey))
                  next.delete(node.columnKey)
                else
                  next.add(node.columnKey)
                expandedKeys.value = next
              }}
            >
              {hasChildren ? (expanded ? '-' : '+') : null}
            </span>
            {checkable
              ? (
                  <span
                    class={[
                      'ant-tree-checkbox',
                      state === 'checked' ? 'ant-tree-checkbox-checked' : undefined,
                      state === 'indeterminate' ? 'ant-tree-checkbox-indeterminate' : undefined,
                      disable.checkboxDisabled ? 'ant-tree-checkbox-disabled' : undefined,
                    ]}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation()
                      if (!disable.checkboxDisabled)
                        setColumnShow(node.columnKey, state !== 'checked')
                    }}
                  >
                    <span class="ant-tree-checkbox-inner" />
                  </span>
                )
              : null}
            <span
              class="ant-tree-node-content-wrapper"
              onClick={() => {
                if (!disable.checkboxDisabled && checkable)
                  setColumnShow(node.columnKey, state !== 'checked')
              }}
              onDragstart={() => draggingKey.value = node.columnKey}
              onDragenter={() => {}}
              onDragover={(event: DragEvent) => event.preventDefault()}
              onDrop={(event: DragEvent) => {
                event.preventDefault()
                moveColumn(draggingKey.value, node.columnKey, 1)
                draggingKey.value = undefined
              }}
              onDragend={() => draggingKey.value = undefined}
            >
              <span class={[`${prefixCls.value}-list-item`, hashId]}>
                <div class={[`${prefixCls.value}-list-item-title`, hashId]}>
                  <Typography.Text style={{ width: '80px' }} ellipsis={{ tooltip: runFunction(node.titleNode, node) }}>
                    {node.titleNode}
                  </Typography.Text>
                </div>
                {renderPinAction(node)}
              </span>
            </span>
          </div>
          {expanded && hasChildren ? node.children!.map(child => renderTreeNode(child, level + 1)) : null}
        </>
      )
    }

    function renderCheckboxList(list: ColumnNode[], title: string, showTitle = true) {
      if (!list.length)
        return null
      return (
        <>
          {showTitle ? <span class={[`${prefixCls.value}-list-title`, hashId]}>{title}</span> : null}
          <div class="ant-tree ant-tree-block-node">
            <div class="ant-tree-list">
              <div class="ant-tree-list-holder" style={{ maxHeight: props.listsHeight ? `${props.listsHeight}px` : '280px', overflow: 'auto' }}>
                <div class="ant-tree-list-holder-inner">
                  {list.map(node => renderTreeNode(node))}
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }

    function renderGroupList() {
      const leftList: ColumnNode[] = []
      const rightList: ColumnNode[] = []
      const list: ColumnNode[] = []
      localColumns.value.forEach((node) => {
        const fixed = columnsMap.value[node.columnKey]?.fixed ?? node.fixed
        if (fixed === 'left') {
          leftList.push(node)
          return
        }
        if (fixed === 'right') {
          rightList.push(node)
          return
        }
        list.push(node)
      })
      const showLeft = leftList.length > 0
      const showRight = rightList.length > 0
      return (
        <div class={[`${prefixCls.value}-list`, showLeft || showRight ? `${prefixCls.value}-list-group` : undefined, hashId]}>
          {renderCheckboxList(leftList, intl.getMessage('tableToolBar.leftFixedTitle', '固定在左侧'))}
          {renderCheckboxList(list, intl.getMessage('tableToolBar.noFixedTitle', '不固定'), showLeft || showRight)}
          {renderCheckboxList(rightList, intl.getMessage('tableToolBar.rightFixedTitle', '固定在右侧'))}
        </div>
      )
    }

    return () => {
      const checkedReset = props.checkedReset ?? true
      const overlay = open.value
        ? (
            <div class={['ant-popover', `${prefixCls.value}-overlay`, hashId]}>
              <div class="ant-popover-content">
                <div class="ant-popover-inner">
                  <div class={[`${prefixCls.value}-title`, hashId]}>
                    {props.checkable === false
                      ? <div />
                      : (
                          <Checkbox
                            indeterminate={indeterminate.value}
                            checked={allChecked.value}
                            onChange={(event: any) => setAllSelectAction(event?.target?.checked)}
                          >
                            {intl.getMessage('tableToolBar.columnDisplay', '列展示')}
                          </Checkbox>
                        )}
                    {checkedReset
                      ? (
                          <a class={[`${prefixCls.value}-action-rest-button`, hashId]} onClick={clearClick}>
                            {intl.getMessage('tableToolBar.reset', '重置')}
                          </a>
                        )
                      : null}
                    {props.extra ? <Space size={12} align="center">{props.extra}</Space> : null}
                  </div>
                  {renderGroupList()}
                </div>
              </div>
            </div>
          )
        : null

      const trigger = props.children || slots.default?.() || (
        <Tooltip title={intl.getMessage('tableToolBar.columnSetting', '列设置')}>
          {props.settingIcon || <SettingOutlined />}
        </Tooltip>
      )

      return wrapSSR(
        <span class={hashId}>
          <span onClick={() => open.value = true}>{trigger}</span>
          {overlay}
        </span>,
      )
    }
  },
})
