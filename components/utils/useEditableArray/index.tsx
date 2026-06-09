import type { FormInstance } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { NamePath } from '../typing'
import { LoadingOutlined } from '@antdv-next/icons'
import { get, warning as rcWarning, set } from '@v-c/util'
import { message, Popconfirm } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { useIntl } from '../../provider'
import { merge } from '../../provider/utils/merge'
import { useProFormContext } from '../components/ProFormContext'
import { conversionMomentValue } from '../conversionMomentValue'
import { useDebounceFn } from '../hooks/useDebounceFn'
import { useDeepCompareEffect } from '../hooks/useDeepCompareEffect'
import { usePrevious } from '../hooks/usePrevious'
import { useRefFunction } from '../hooks/useRefFunction'
import useLazyKVMap from '../useLazyKVMap'

export type GetRowKey<RecordType> = (record: RecordType, index?: number) => string | number

/**
 * 显示警告信息
 * @param messageStr
 */
function warning(messageStr: VNodeChild) {
  return message.warning(messageStr as any)
}

export type RowEditableType = 'single' | 'multiple'

export type RecordKey = string | number | (string | number)[]

const { noteOnce } = rcWarning

export function recordKeyToString(rowKey: RecordKey): string {
  if (Array.isArray(rowKey))
    return rowKey.join(',')
  return String(rowKey)
}

/**
 * 判断两个 RecordKey 是否语义相等（容忍 number/string 与数组顺序差异）。
 *
 * 设计动机：直接 `===` 对 RecordKey 不安全：
 *  - `1` !== `'1'`（number/string 混用场景常见）
 *  - 数组永远是引用相等，例如 `['a'] !== ['a']`
 *
 * 实现：先用 recordKeyToString 拍平为标量，再做 `String(...)` 字符串比较，
 * 双侧都为 null/undefined 时返回 true 视作"未指定 key"匹配。
 */
export function isSameRecordKey(
  a: RecordKey | null | undefined,
  b: RecordKey | null | undefined,
): boolean {
  if (a == null && b == null)
    return true
  if (a == null || b == null)
    return false
  return String(recordKeyToString(a)) === String(recordKeyToString(b))
}

/**
 * Normalize antd Form `NamePath` segments.
 *
 * - Preserve `0` (number) and other falsy-but-valid segments
 * - Flatten nested arrays (e.g. `name={['a','b']}`)
 * - Convert number segments to string to align with `buildNamePath` behavior
 */
function normalizeNamePath(...segments: any[]): (string | number)[] {
  return segments
    .flat(1)
    .filter(key => key !== undefined && key !== null)
    .map(key => (typeof key === 'number' ? key.toString() : key))
}

export interface AddLineOptions {
  position?: 'top' | 'bottom'
  recordKey?: RecordKey
  newRecordType?: 'dataSource' | 'cache'
  /** 要增加到哪个节点下，一般用于多重嵌套表格 */
  parentKey?: RecordKey
}

export interface NewLineConfig<T> {
  defaultValue?: T
  options: AddLineOptions
}

export type ActionRenderFunction<T> = (
  row: T,
  config: ActionRenderConfig<T, NewLineConfig<T>>,
  defaultDoms: {
    save: VNodeChild
    delete: VNodeChild
    cancel: VNodeChild
  },
) => VNodeChild[]

export interface RowEditableConfig<DataType> {
  /** @name 控制可编辑表格的 From的设置 */
  formProps?: Record<string, any>
  /** @name 控制可编辑表格的 form */
  form?: FormInstance
  /**
   * @type single | multiple
   * @name 编辑的类型，支持单选和多选
   */
  type?: RowEditableType
  /** @name 正在编辑的列 */
  editableKeys?: RecordKey[]
  /** 正在编辑的列修改的时候 */
  onChange?: (editableKeys: RecordKey[], editableRows: DataType[] | DataType) => void
  /** 正在编辑的列修改的时候 */
  onValuesChange?: (record: DataType, dataSource: DataType[]) => void
  /** @name 自定义编辑的操作 */
  actionRender?: ActionRenderFunction<DataType>
  /** 行保存的时候 */
  onSave?: (key: RecordKey, record: DataType & { index?: number }, originRow: DataType & { index?: number }, newLineConfig?: NewLineConfig<DataType>) => Promise<any | void>
  /** 行取消的时候 */
  onCancel?: (key: RecordKey, record: DataType & { index?: number }, originRow: DataType & { index?: number }, newLineConfig?: NewLineConfig<DataType>) => Promise<any | void>
  /** 行删除的时候 */
  onDelete?: (key: RecordKey, row: DataType & { index?: number }) => Promise<any | void>
  /** 删除行时的确认消息 */
  deletePopconfirmMessage?: VNodeChild
  /** 只能编辑一行的的提示 */
  onlyOneLineEditorAlertMessage?: VNodeChild
  /** 同时只能新增一行的提示 */
  onlyAddOneLineAlertMessage?: VNodeChild
  /** Table 上设置的name，用于拼接name来获取数据 */
  tableName?: NamePath
  /** 保存一行的文字 */
  saveText?: VNodeChild
  /** 取消编辑一行的文字 */
  cancelText?: VNodeChild
  /** 删除一行的文字 */
  deleteText?: VNodeChild
  /**
   * 解决分页带来的 FormItem namePath 使用错误的 index 作为路径
   * @link https://github.com/ant-design/pro-components/issues/7790
   */
  getRealIndex?: (record: DataType) => number
  /**
   * 与 ProTable `dateFormatter` 一致；合并到 dataSource 时把行内的 dayjs / 反序列化 dayjs 转为 string 或 number
   */
  dateFormatter?: Parameters<typeof conversionMomentValue>[1]
}

export interface ActionTypeText<T> {
  deleteText?: VNodeChild
  cancelText?: VNodeChild
  saveText?: VNodeChild
  editorType?: 'Array' | 'Map'
  addEditRecord?: (row: T, options?: AddLineOptions) => boolean
}

export type ActionRenderConfig<T, LineConfig = NewLineConfig<T>> = {
  editableKeys?: RowEditableConfig<T>['editableKeys']
  recordKey: RecordKey
  preEditRowRef: { current: T | null }
  /**
   * 多行编辑场景下，按 recordKey 缓存每一行进入编辑前的快照（允许为 null，用于标记“新建行”）
   * 用于避免 preEditRowRef（单引用）在多行编辑时被覆盖导致取消误删/误还原的问题
   */
  preEditRowRefs?: { current: Map<string, T | null> }
  index?: number
  cancelEditable: (key: RecordKey) => void | Promise<void | boolean>
  onSave: RowEditableConfig<T>['onSave']
  onCancel: RowEditableConfig<T>['onCancel']
  onDelete?: RowEditableConfig<T>['onDelete']
  deletePopconfirmMessage?: RowEditableConfig<T>['deletePopconfirmMessage']
  setEditableRowKeys: (value: RecordKey[]) => void
  newLineConfig?: LineConfig
  tableName?: NamePath
  children?: VNodeChild
} & ActionTypeText<T>

export interface SaveEditableActionRef<T = any> {
  /**
   * 直接触发保存动作
   *
   * @throws 如果校验失败，会抛出异常
   */
  save: () => ReturnType<NonNullable<RowEditableConfig<T>['onSave']>> | Promise<void>
}

/**
 * 扁平化记录树结构为 Map
 */
function flattenRecordsToMap<RecordType>(
  records: RecordType[],
  getRowKey: GetRowKey<RecordType>,
  childrenColumnName: string,
  parentKey?: string | number,
  parentIndex?: number,
): Map<string, RecordType & { map_row_key?: string, map_row_parentKey?: string | number }> {
  const kvMap = new Map<string, RecordType & { map_row_key?: string, map_row_parentKey?: string | number }>()

  records.forEach((record, index) => {
    // 历史实现：用 `parentIndex * 10 + index` 把"全局扁平后的位置"传给 getRowKey 的第二参数，
    // 用于嵌套树场景下当 rowKey 退化到 index 时仍尽量保持唯一性。
    // 这种拼法在「兄弟节点超过 9 个」时会哈希冲突（如父1的第10个孩子和父2的第0个孙都是 20），
    // 但 editor-table 等测试已经依赖了这种 index 的具体值（重建 dataSource 时反查 map），
    // 直接改成 `index` 会让保存编辑后丢行（`saveEditable should save and quit editing` 测试）。
    // → 暂保留原实现，待用 path 字符串替代上层 map 的 key 维度后再彻底重构。
    const eachIndex = (parentIndex || 0) * 10 + index
    const recordKey = getRowKey(record, eachIndex).toString()

    const hasChildren = record && typeof record === 'object' && childrenColumnName in record

    if (hasChildren) {
      const children = (record as any)[childrenColumnName] || []
      const childrenMap = flattenRecordsToMap(
        children,
        getRowKey,
        childrenColumnName,
        recordKey,
        eachIndex,
      )
      childrenMap.forEach((value, key) => kvMap.set(key, value))
    }

    const newRecord = {
      ...record,
      map_row_key: recordKey,
      map_row_parentKey: parentKey,
    }
    delete (newRecord as any)[childrenColumnName]
    if (!parentKey)
      delete (newRecord as any).map_row_parentKey
    kvMap.set(recordKey, newRecord)
  })

  return kvMap
}

/**
 * 重建树结构
 */
function rebuildTreeStructure<RecordType>(
  map: Map<string, RecordType & { map_row_parentKey?: string | number, map_row_key?: string }>,
  childrenColumnName: string,
  action: 'update' | 'top' | 'delete',
): RecordType[] {
  const childrenMap = new Map<string, RecordType[]>()
  const result: RecordType[] = []

  const addNewRecordToChildren = (fillChildren: boolean) => {
    map.forEach((value) => {
      if (value.map_row_parentKey != null && !value.map_row_key) {
        const { map_row_parentKey, ...rest } = value
        const parentKeyStr = String(map_row_parentKey)
        if (!childrenMap.has(parentKeyStr))
          childrenMap.set(parentKeyStr, [])
        if (fillChildren)
          childrenMap.get(parentKeyStr)?.push(rest as unknown as RecordType)
      }
    })
  }

  addNewRecordToChildren(action === 'top')

  // 第一步：将所有有 parentKey 的节点添加到 childrenMap
  // 这一步不获取 children，只是添加节点到对应的父节点下
  map.forEach((value) => {
    if (value.map_row_parentKey != null && value.map_row_key) {
      const { map_row_parentKey, map_row_key, isNewRecord, ...rest } = value as any
      const record = { ...rest, map_row_key } as any
      // 确保 parentKey 的类型转换与 flattenRecordsToMap 中的 recordKey 一致
      const parentKeyStr = map_row_parentKey != null ? String(map_row_parentKey) : null

      if (!parentKeyStr)
        return

      if (!childrenMap.has(parentKeyStr))
        childrenMap.set(parentKeyStr, [])

      // 如果是新记录且 action 为 'top'，添加到数组开头；否则添加到末尾
      if (isNewRecord && action === 'top')
        childrenMap.get(parentKeyStr)?.unshift(record as RecordType)
      else
        childrenMap.get(parentKeyStr)?.push(record as RecordType)
    }
  })

  // 第二步：为所有节点获取 children
  map.forEach((value) => {
    if (value.map_row_parentKey != null && value.map_row_key) {
      const { map_row_parentKey, map_row_key } = value as any
      const parentKeyStr = map_row_parentKey != null ? String(map_row_parentKey) : null

      if (!parentKeyStr)
        return

      const children = childrenMap.get(parentKeyStr)
      if (children && children.length > 0) {
        const recordIndex = children.findIndex((r: any) => {
          return String(r.map_row_key) === String(map_row_key)
        })

        if (recordIndex >= 0 && childrenMap.has(map_row_key)) {
          children[recordIndex] = {
            ...children[recordIndex],
            [childrenColumnName]: childrenMap.get(map_row_key),
          } as RecordType
        }
      }
    }
  })

  addNewRecordToChildren(action === 'update')

  map.forEach((value) => {
    if (!value.map_row_parentKey) {
      const { map_row_key, ...rest } = value
      const record = map_row_key && childrenMap.has(map_row_key)
        ? { ...rest, [childrenColumnName]: childrenMap.get(map_row_key) }
        : rest
      result.push(record as RecordType)
    }
  })

  return result
}

/**
 * 使用map 来删除数据，性能一般 但是准确率比较高
 */
export function editableRowByKey<RecordType>(
  keyProps: {
    data: RecordType[]
    childrenColumnName: string
    getRowKey: GetRowKey<RecordType>
    key: RecordKey
    row: RecordType
  },
  action: 'update' | 'top' | 'delete',
) {
  const { getRowKey, row, data, childrenColumnName = 'children' } = keyProps
  const key = recordKeyToString(keyProps.key)?.toString()

  const kvMap = flattenRecordsToMap(data, getRowKey, childrenColumnName)

  if (action === 'delete') {
    kvMap.delete(key)
  }
  else if (action === 'top' || action === 'update') {
    const existingRecord = kvMap.get(key)
    if (existingRecord) {
      kvMap.set(key, {
        ...existingRecord,
        ...row,
      } as any)
    }
    else {
      // 如果记录不存在，创建一个新记录（用于新增场景）
      // 保留 map_row_parentKey 以便正确处理嵌套子节点
      // 添加标记以便在 rebuildTreeStructure 中识别新记录
      kvMap.set(key, {
        ...row,
        map_row_key: key,
        map_row_parentKey: (row as any).map_row_parentKey,
        isNewRecord: true,
      } as any)
    }
  }

  return rebuildTreeStructure(kvMap, childrenColumnName, action)
}

/**
 * 保存按钮的dom
 */
export const SaveEditableAction = defineComponent({
  name: 'SaveEditableAction',
  props: {
    config: { type: Object, required: true },
  },
  setup(props, { expose }) {
    const context = useProFormContext()
    const loading = ref(false)

    const getConfig = () => props.config as ActionRenderConfig<any> & { row: any, children?: any }

    const save = useRefFunction(async () => {
      const c = getConfig()
      const { recordKey, onSave, row, newLineConfig, editorType, tableName } = c
      try {
        const isMapEditor = editorType === 'Map'
        // 为了兼容类型为 array 的 dataIndex，当 recordKey 是一个数组时，用于获取表单值的 key 只取第一项
        const namePath = normalizeNamePath(
          tableName,
          Array.isArray(recordKey) ? recordKey[0] : recordKey,
        ) as string[]
        loading.value = true
        const form = context.formRef?.value
        try {
          await form?.validateFields?.(namePath, { recursive: true })
        }
        catch (error: any) {
          loading.value = false
          throw error
        }

        const fields = (() => {
          const formattedObject = context?.getFieldFormatValueObject?.(namePath as any)
          const formattedRow = formattedObject != null ? get(formattedObject, namePath as any) : null
          return formattedRow ?? form?.getFieldValue?.(namePath)
        })()
        // 处理 dataIndex 为数组的情况
        if (Array.isArray(recordKey) && recordKey.length > 1) {
          const [, ...recordKeyPath] = recordKey
          const curValue = get(fields, recordKeyPath as string[])
          set(fields, recordKeyPath as (number | string)[], curValue)
        }
        const data = isMapEditor ? set({}, namePath, fields) : fields

        const res = await onSave?.(
          recordKey,
          merge({}, row, data),
          row,
          newLineConfig,
        )
        loading.value = false
        return res
      }
      catch (error) {
        loading.value = false
        throw error
      }
    })

    expose({ save })

    return () => {
      const c = getConfig()
      return (
        <a
          key="save"
          onClick={async (e: Event) => {
            e.stopPropagation()
            e.preventDefault()
            try {
              await save()
            }
            catch {
              // 验证错误会被 validateFields 抛出，这里不需要处理
            }
          }}
        >
          {loading.value ? <LoadingOutlined style={{ marginInlineEnd: '8px' }} /> : null}
          {c.children || c.saveText || '保存'}
        </a>
      )
    }
  },
})

/**
 * 删除按钮 dom
 */
export const DeleteEditableAction = defineComponent({
  name: 'DeleteEditableAction',
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const loading = ref(false)

    const getConfig = () => props.config as ActionRenderConfig<any> & { row: any, children?: any }

    const onConfirm = useRefFunction(async () => {
      const c = getConfig()
      const { recordKey, onDelete, preEditRowRef, preEditRowRefs, row } = c
      try {
        loading.value = true
        const res = await onDelete?.(recordKey, row)
        loading.value = false
        if (res === false)
          return false
        return res
      }
      catch {
        loading.value = false
        return null
      }
      finally {
        const recordKeyStr = recordKeyToString(recordKey)?.toString()
        if (recordKeyStr)
          preEditRowRefs?.current?.delete(recordKeyStr)
        if (preEditRowRef)
          preEditRowRef.current = null
      }
    })

    return () => {
      const c = getConfig()
      if (c.children === false)
        return null
      return (
        <Popconfirm
          key="delete"
          title={(c.deletePopconfirmMessage || '确定要删除这条记录吗？') as any}
          onConfirm={onConfirm}
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement || document.body}
        >
          <a>
            {loading.value ? <LoadingOutlined style={{ marginInlineEnd: '8px' }} /> : null}
            {c.children || c.deleteText || '删除'}
          </a>
        </Popconfirm>
      )
    }
  },
})

/**
 * 取消按钮 dom
 */
const CancelEditableAction = defineComponent({
  name: 'CancelEditableAction',
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const context = useProFormContext()

    const getConfig = () => props.config as ActionRenderConfig<any> & { row: any }

    const onClick = async (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      const c = getConfig()
      const { recordKey, tableName, newLineConfig, editorType, onCancel, cancelEditable, row, preEditRowRef, preEditRowRefs } = c
      const form = context.formRef?.value
      const isMapEditor = editorType === 'Map'
      const recordKeyStr = recordKeyToString(recordKey)?.toString()
      const namePath = normalizeNamePath(tableName, recordKey) as string[]
      const fields = (() => {
        const formattedObject = context?.getFieldFormatValueObject?.(namePath as any)
        const formattedRow = formattedObject != null ? get(formattedObject, namePath as any) : null
        return formattedRow ?? form?.getFieldValue?.(namePath)
      })()
      const record = isMapEditor ? set({}, namePath, fields) : fields

      // 在清理编辑态前，先捕获“编辑前快照”（多行编辑时必须按 key 取值）
      const cachedPreEditRow = recordKeyStr != null ? preEditRowRefs?.current?.get(recordKeyStr) : undefined

      const isNewLineKeyMatch = (() => {
        const newLineKey = newLineConfig?.options?.recordKey
        if (newLineKey == null || recordKey == null)
          return false
        const newLineKeyStr = recordKeyToString(newLineKey)?.toString()
        const currentKeyStr = recordKeyToString(recordKey)?.toString()
        if (!newLineKeyStr || !currentKeyStr)
          return false
        return newLineKeyStr === currentKeyStr
      })()

      const res = await onCancel?.(recordKey, record, row, newLineConfig)
      await cancelEditable(recordKey)
      /** 重置为默认值，不然编辑的行会丢掉 */
      const restoreRow = cachedPreEditRow ?? preEditRowRef?.current ?? row
      const shouldDeleteNewRow = cachedPreEditRow === null
        || (cachedPreEditRow === undefined && preEditRowRef?.current === null && isNewLineKeyMatch)

      if (shouldDeleteNewRow) {
        // 如果不存在历史值，说明是新的行，干掉他
        await c.onDelete?.(recordKey, row)
      }
      else if (restoreRow != null) {
        form?.setFieldsValue?.(set({}, namePath, restoreRow))
      }

      if (recordKeyStr)
        preEditRowRefs?.current?.delete(recordKeyStr)
      if (preEditRowRef)
        preEditRowRef.current = null

      return res
    }

    return () => {
      const c = getConfig()
      return (
        <a key="cancel" onClick={onClick}>
          {c.cancelText || '取消'}
        </a>
      )
    }
  },
})

export function defaultActionRender<T>(row: T, config: ActionRenderConfig<T, NewLineConfig<T>>) {
  const { recordKey, newLineConfig, saveText, deleteText } = config
  const saveRef: { current: SaveEditableActionRef<T> | null } = { current: null }

  return {
    save: (
      <SaveEditableAction
        key={`save${recordKeyToString(recordKey)}`}
        ref={(vm: any) => { saveRef.current = vm }}
        config={{ ...config, row, children: saveText }}
      />
    ),
    saveRef,
    delete: !isSameRecordKey(newLineConfig?.options.recordKey, recordKey)
      ? (
          <DeleteEditableAction
            key={`delete${recordKeyToString(recordKey)}`}
            config={{ ...config, row, children: deleteText }}
          />
        )
      : undefined,
    cancel: (
      <CancelEditableAction
        key={`cancel${recordKeyToString(recordKey)}`}
        config={{ ...config, row }}
      />
    ),
  }
}

/**
 * 一个方便的hooks 用于维护编辑的状态
 */
export function useEditableArray<RecordType extends Record<string, any>>(
  props: RowEditableConfig<RecordType> & {
    getRowKey: GetRowKey<RecordType>
    dataSource: RecordType[]
    onValuesChange?: (record: RecordType, dataSource: RecordType[]) => void
    childrenColumnName: string | undefined
    setDataSource: (dataSource: RecordType[]) => void
    columns?: any[]
  },
) {
  const proFormContext = useProFormContext()

  const normalizeRowDateValues = useRefFunction((row: RecordType | null | undefined) => {
    if (row == null || typeof row !== 'object')
      return row as unknown as RecordType
    return conversionMomentValue(row, props.dateFormatter ?? 'string', {}, false) as RecordType
  })

  const intl = useIntl()

  /** 点击开始编辑之前的保存数据用的 */
  const preEditRowRef: { current: RecordType | null } = { current: null }
  const preEditRowRefs: { current: Map<string, RecordType | null> } = { current: new Map() }

  const newLineRecordCache = shallowRef<NewLineConfig<RecordType> | undefined>(undefined)
  const setNewLineRecordCache = (value: NewLineConfig<RecordType> | undefined) => {
    newLineRecordCache.value = value
  }
  const newLineRecordRef = {
    get current() {
      return newLineRecordCache.value
    },
  }

  /** 构建数据源 key 索引映射表 */
  const buildDataSourceKeyIndexMap = useRefFunction(() => {
    const map = new Map<string | number, string | number>()
    const traverseRecords = (records: RecordType[], parentKey?: string) => {
      records?.forEach((record, index) => {
        const indexKey = parentKey == null ? index.toString() : `${parentKey}_${index}`
        const recordKey = recordKeyToString(props.getRowKey(record, -1))
        if (recordKey == null)
          return
        map.set(indexKey, recordKey)
        map.set(recordKey.toString(), indexKey)
        const children = props.childrenColumnName && (record as any)?.[props.childrenColumnName]
        if (children)
          traverseRecords(children, indexKey)
      })
    }
    traverseRecords(props.dataSource)
    return map
  })

  const dataSourceKeyIndexMapRef: { current: Map<string | number, string | number> } = {
    current: buildDataSourceKeyIndexMap(),
  }

  // 注意：必须用同步的 useDeepCompareEffect，不能再用 debounce 版本——后者会让短时间内
  // 多次更新 dataSource 时 Map 处于过期状态，cancelEditable / saveEditable / validateCanAddRecord
  // 通过 dataSourceKeyIndexMapRef 反查映射 key 时会拿到旧映射，新增/删除场景下偶发查不到。
  useDeepCompareEffect(() => {
    dataSourceKeyIndexMapRef.current = buildDataSourceKeyIndexMap()
  }, [() => props.dataSource])

  const editableType = props.type || 'single'

  const getRecordByKey = useRefFunction((key: string | number) => {
    const [g] = useLazyKVMap<RecordType>(props.dataSource, props.childrenColumnName || 'children', props.getRowKey)
    return g(key)
  })

  // 受控/非受控 editableKeys（Vue 等价于 React 的 useControlledState）
  const innerEditableKeys = ref<RecordKey[]>(props.editableKeys || [])
  watch(
    () => props.editableKeys,
    (value) => {
      if (value)
        innerEditableKeys.value = value
    },
  )
  const editableKeys = computed<RecordKey[]>(() => props.editableKeys ?? innerEditableKeys.value)
  const setEditableRowKeysInner = (next: RecordKey[] | undefined) => {
    innerEditableKeys.value = next ?? []
  }

  const setEditableRowKeys = useRefFunction((updater: RecordKey[] | undefined | ((prev: RecordKey[] | undefined) => RecordKey[] | undefined)) => {
    const prev = editableKeys.value
    const next = typeof updater === 'function'
      ? (updater as (p: RecordKey[] | undefined) => RecordKey[] | undefined)(prev)
      : updater
    const cleanKeys = next?.filter(key => key !== undefined) ?? []
    const editingRecords = cleanKeys
      .map(key => getRecordByKey(key as string | number))
      .filter((k): k is RecordType => k !== undefined)
    const editingPayload = editableType === 'single'
      ? (editingRecords[0] as RecordType | undefined)
      : editingRecords
    props?.onChange?.(cleanKeys, editingPayload as RecordType | RecordType[])
    setEditableRowKeysInner(next)
  })

  const editableKeysRef = usePrevious(() => editableKeys.value)

  /** 检查 key 是否在编辑列表中 */
  const checkKeyInEditableList = useRefFunction((key: string, keysList: string[]): boolean => {
    return keysList.includes(key)
  })

  /** 这行是不是编辑状态 */
  const isEditable = useRefFunction((row: RecordType & { index?: number }) => {
    const recordKeyWithIndex = props.getRowKey(row, row.index)?.toString()
    const recordKey = props.getRowKey(row, -1)?.toString()
    const stringEditableKeys = editableKeys.value?.map(key => key?.toString()) || []
    const stringEditableKeysRef = editableKeysRef.value?.map(key => key?.toString()) || []

    const preIsEditable = checkKeyInEditableList(recordKey, stringEditableKeysRef)
      || checkKeyInEditableList(recordKeyWithIndex, stringEditableKeysRef)

    return {
      recordKey,
      isEditable: checkKeyInEditableList(recordKey, stringEditableKeys)
        || checkKeyInEditableList(recordKeyWithIndex, stringEditableKeys),
      preIsEditable,
    }
  })

  /** 验证是否可以开始编辑 */
  const validateCanStartEdit = useRefFunction((): boolean => {
    const hasEditableKeys = editableKeys.value && editableKeys.value.length > 0
    if (
      hasEditableKeys
      && editableType === 'single'
      && props.onlyOneLineEditorAlertMessage !== false
    ) {
      warning(
        props.onlyOneLineEditorAlertMessage
        || intl.getMessage('editableTable.onlyOneLineEditor', '只能同时编辑一行'),
      )
      return false
    }
    return true
  })

  /** 查找记录 */
  const findRecordByKey = useRefFunction((recordKey: string | number): RecordType | null => {
    return props.dataSource?.find((recordData, index) => {
      return props.getRowKey(recordData, index) === recordKey
    }) ?? null
  })

  /** 进入编辑状态 */
  const startEditable = useRefFunction((recordKey: string | number, record?: RecordType) => {
    if (!validateCanStartEdit())
      return false

    const isAlreadyEditable = editableKeys.value?.some(
      key => key === recordKey || key?.toString() === recordKey?.toString(),
    )

    if (!isAlreadyEditable) {
      const newKeys = editableKeys.value ? [...editableKeys.value, recordKey] : [recordKey]
      setEditableRowKeys(newKeys)
    }

    preEditRowRef.current = record ?? findRecordByKey(recordKey) ?? null
    const recordKeyStr = recordKeyToString(recordKey)?.toString()
    if (recordKeyStr)
      preEditRowRefs.current.set(recordKeyStr, preEditRowRef.current)

    return true
  })

  /** 清理编辑状态 */
  const clearEditableState = useRefFunction((recordKey: RecordKey) => {
    const relayKey = recordKeyToString(recordKey)
    const relayKeyStr = relayKey != null ? relayKey.toString() : null
    if (relayKeyStr == null)
      return
    const newKeys = editableKeys.value?.filter(
      key => key?.toString() !== relayKeyStr && key !== relayKey,
    ) ?? []
    setEditableRowKeys(newKeys)
  })

  /** 拿到当前关联的 form 实例（兼容 props.form / props.formProps.formRef / ProFormContext） */
  const resolveFormInstance = useRefFunction((): any => {
    const formRef = props.formProps?.formRef
    return proFormContext.formRef?.value ?? formRef?.value ?? formRef?.current ?? props.form
  })

  /** 若当前 recordKey 命中 newLineRecordCache，则返回该缓存供 onCancel 使用 */
  const matchNewLineConfig = useRefFunction((recordKey: RecordKey): NewLineConfig<RecordType> | undefined => {
    if (!newLineRecordCache.value)
      return undefined
    const cacheRecordKey = newLineRecordCache.value.options?.recordKey
    if (cacheRecordKey == null)
      return undefined
    return isSameRecordKey(cacheRecordKey, recordKey) ? newLineRecordCache.value : undefined
  })

  /** cancelEditable 子步骤 1：调用用户 onCancel */
  const tryRunOnCancel = useRefFunction(async (recordKey: RecordKey) => {
    if (!props.onCancel)
      return
    const keyForFind = Array.isArray(recordKey) ? recordKey[0] : recordKey
    const record = findRecordByKey(keyForFind as string | number)
    const originRow = preEditRowRef.current
    const newLineConfig = matchNewLineConfig(recordKey)
    const fallback = record || (newLineConfig?.defaultValue as any) || ({} as any)
    try {
      await props.onCancel(recordKey, fallback, originRow || fallback, newLineConfig)
    }
    catch (error) {
      // onCancel 抛异常不应阻断后续清理
      console.error('onCancel error:', error)
    }
  })

  /** cancelEditable 子步骤 2：清空命中的 newLineRecordCache */
  const tryClearNewLineCache = useRefFunction((recordKey: RecordKey) => {
    if (!newLineRecordCache.value)
      return
    if (isSameRecordKey(newLineRecordCache.value.options.recordKey, recordKey))
      setNewLineRecordCache(undefined)
  })

  /** cancelEditable 子步骤 3：还原 form 中该行字段或清空 */
  const tryRestoreFormFields = useRefFunction((recordKey: RecordKey) => {
    const originRow = preEditRowRef.current
    if (!originRow)
      return
    if (!isSameRecordKey(props.getRowKey(originRow, -1), recordKey))
      return

    try {
      const form = resolveFormInstance()
      if (!form)
        return

      if (props.tableName) {
        const namePath = normalizeNamePath(props.tableName, recordKey) as string[]
        form.setFieldsValue?.(set({}, namePath, originRow))
      }
      else {
        const recordKeyStr = recordKeyToString(recordKey)?.toString()
        if (!recordKeyStr)
          return
        try {
          form.resetFields?.([[recordKeyStr]])
          form.setFieldsValue?.({ [recordKeyStr]: undefined })
        }
        catch (error) {
          console.warn('Failed to clear form fields in cancelEditable:', error)
        }
      }
    }
    catch (error) {
      console.warn('Failed to reset form fields in cancelEditable:', error)
    }

    preEditRowRef.current = null
  })

  /**
   * 退出编辑状态
   * 流程：① 必要时按 mappedKey 重试一次 → ② onCancel → ③ 清 newLineCache
   *      → ④ 还原 form 字段 → ⑤ 清编辑态
   */
  const cancelEditable = useRefFunction(async (recordKey: RecordKey, needReTry?: boolean): Promise<boolean> => {
    const relayKey = recordKeyToString(recordKey)
    const relayKeyStr = relayKey != null ? relayKey.toString() : null
    const mappedKey = relayKeyStr != null ? dataSourceKeyIndexMapRef.current.get(relayKeyStr) : undefined
    const isInEditableSet = (editableKeys.value ?? []).some(key => isSameRecordKey(key, recordKey))

    if (!isInEditableSet && mappedKey && (needReTry ?? true) && props.tableName)
      return cancelEditable(mappedKey, false)

    if (isInEditableSet)
      await tryRunOnCancel(recordKey)

    tryClearNewLineCache(recordKey)

    if (isInEditableSet)
      tryRestoreFormFields(recordKey)

    clearEditableState(recordKey)
    return true
  })

  const propsOnValuesChange = useDebounceFn(async (...rest: any[]) => {
    // @ts-expect-error 透传给用户回调
    props.onValuesChange?.(...rest)
  }, 64)

  /** 构建表单字段路径 */
  const buildFormFieldPath = useRefFunction((recordKey: string): string[] => {
    return [props.tableName || '', recordKey]
      .flat(1)
      .filter(key => key || key === 0) as string[]
  })

  /** 更新数据源中的编辑行 */
  const updateDataSourceWithEditableRows = useRefFunction((dataSource: RecordType[], values: RecordType): RecordType[] => {
    let updatedDataSource = dataSource

    editableKeys.value?.forEach((eachRecordKey) => {
      if (newLineRecordCache.value && isSameRecordKey(newLineRecordCache.value.options.recordKey, eachRecordKey))
        return

      const recordKey = eachRecordKey.toString()
      const fieldPath = buildFormFieldPath(recordKey)
      const editRow = get(values, fieldPath)

      if (!editRow)
        return

      updatedDataSource = editableRowByKey(
        {
          data: updatedDataSource,
          getRowKey: props.getRowKey,
          row: normalizeRowDateValues(editRow),
          key: recordKey,
          childrenColumnName: props.childrenColumnName || 'children',
        },
        'update',
      )
    })

    return updatedDataSource
  })

  /** 获取当前编辑的行数据 */
  const getCurrentEditRow = useRefFunction((value: RecordType, values: RecordType, dataSource: RecordType[]): RecordType => {
    const valueKeys = Object.keys(value || {})
    if (valueKeys.length === 0)
      return newLineRecordCache.value?.defaultValue || ({} as RecordType)

    const recordKey = valueKeys.pop()?.toString() || ''
    if (!recordKey)
      return newLineRecordCache.value?.defaultValue || ({} as RecordType)

    const fieldPath = buildFormFieldPath(recordKey)
    const newLineRecordData = normalizeRowDateValues({
      ...newLineRecordCache.value?.defaultValue,
      ...get(values, fieldPath),
    } as RecordType)

    const existsInDataSource = dataSourceKeyIndexMapRef.current.has(recordKeyToString(recordKey))

    if (existsInDataSource) {
      const foundRow = dataSource.find((item, index) => {
        const key = props.getRowKey(item, index)?.toString()
        return key === recordKey
      })
      return foundRow || newLineRecordData
    }

    return newLineRecordData
  })

  const onValuesChange = useRefFunction((value: RecordType, values: RecordType) => {
    if (!props.onValuesChange)
      return

    const updatedDataSource = updateDataSourceWithEditableRows(props.dataSource, values)
    const editRow = getCurrentEditRow(value, values, updatedDataSource)

    propsOnValuesChange.run(editRow, updatedDataSource)
  })

  const saveRefsMap: { current: Map<string | number, { current: SaveEditableActionRef | null }> } = {
    current: new Map(),
  }

  watch(
    () => editableKeys.value,
    () => {
      const aliveKeysSet = new Set<string>()
      ;(editableKeys.value ?? []).forEach((key) => {
        const keyStr = key?.toString()
        if (keyStr == null)
          return
        aliveKeysSet.add(keyStr)
        const mapped = dataSourceKeyIndexMapRef.current.get(keyStr)
        if (mapped != null)
          aliveKeysSet.add(mapped.toString())
      })
      saveRefsMap.current.forEach((_ref, key) => {
        if (!aliveKeysSet.has(key?.toString()))
          saveRefsMap.current.delete(key)
      })
    },
    { flush: 'post' },
  )

  /** 获取保存引用 */
  const getSaveRef = useRefFunction((recordKey: RecordKey) => {
    const relayKey = recordKeyToString(recordKey)
    return saveRefsMap.current.get(relayKey) || saveRefsMap.current.get(relayKey.toString())
  })

  /**
   * 保存编辑行
   * 设计：仅作为 `SaveEditableAction.save` 的外部触发入口。
   */
  const saveEditable = useRefFunction(async (recordKey: RecordKey, needReTry?: boolean): Promise<boolean> => {
    const relayKey = recordKeyToString(recordKey)
    const relayKeyStr = relayKey.toString()
    const mappedKey = dataSourceKeyIndexMapRef.current.get(relayKeyStr)

    const isInEditableSet = (editableKeys.value ?? []).some(key => isSameRecordKey(key, recordKey))

    if (!isInEditableSet && mappedKey && (needReTry ?? true) && props.tableName)
      return saveEditable(mappedKey, false)

    const saveRef = getSaveRef(recordKey)
    if (!saveRef?.current)
      return false

    await saveRef.current.save()
    return true
  })

  /** 验证是否可以新增记录 */
  const validateCanAddRecord = useRefFunction((options?: AddLineOptions): boolean => {
    if (
      options?.parentKey
      && !dataSourceKeyIndexMapRef.current.has(recordKeyToString(options?.parentKey as RecordKey).toString())
    ) {
      console.warn('can\'t find record by key', options?.parentKey)
      return false
    }

    if (newLineRecordRef.current && props.onlyAddOneLineAlertMessage !== false) {
      warning(
        props.onlyAddOneLineAlertMessage
        || intl.getMessage('editableTable.onlyAddOneLine', '只能新增一行'),
      )
      return false
    }

    if (!validateCanStartEdit())
      return false

    return true
  })

  /** 验证记录 key 是否有效 */
  const validateRecordKey = useRefFunction((recordKey: string | number): void => {
    if (recordKey == null && recordKey !== 0 && recordKey !== '') {
      noteOnce(
        false,
        '请设置 recordCreatorProps.record 并返回一个唯一的key  \n  https://procomponents.ant.design/components/editable-table#editable-%E6%96%B0%E5%BB%BA%E8%A1%8C',
      )
      throw new Error('请设置 recordCreatorProps.record 并返回一个唯一的key')
    }
  })

  /** 增加新的行 */
  const addEditRecord = useRefFunction((row: RecordType, options?: AddLineOptions) => {
    if (!validateCanAddRecord(options))
      return false

    const recordKey = props.getRowKey(row, -1)
    validateRecordKey(recordKey)
    const recordKeyStr = recordKeyToString(recordKey)?.toString()
    if (recordKeyStr)
      preEditRowRefs.current.set(recordKeyStr, null)

    const isAlreadyEditable = editableKeys.value?.some(
      key => key === recordKey || key?.toString() === recordKey?.toString(),
    )

    if (!isAlreadyEditable) {
      const newKeys = editableKeys.value ? [...editableKeys.value, recordKey] : [recordKey]
      setEditableRowKeys(newKeys)
    }

    const parentKeyValue = typeof options?.parentKey === 'function'
      ? (options.parentKey as any)()
      : options?.parentKey

    const isDataSourceMode = options?.newRecordType === 'dataSource'
      || (props.tableName && options?.newRecordType !== 'cache')
    if (isDataSourceMode) {
      const actionProps = {
        data: props.dataSource,
        getRowKey: props.getRowKey,
        row: {
          ...row,
          map_row_parentKey: parentKeyValue ? recordKeyToString(parentKeyValue)?.toString() : undefined,
        },
        key: recordKey,
        childrenColumnName: props.childrenColumnName || 'children',
      }
      props.setDataSource(editableRowByKey(actionProps, options?.position === 'top' ? 'top' : 'update'))
    }
    else {
      setNewLineRecordCache({
        defaultValue: row,
        options: { ...options, parentKey: parentKeyValue, recordKey },
      })
    }
    return true
  })

  const saveText = props?.saveText || intl.getMessage('editableTable.action.save', '保存')
  const deleteText = props?.deleteText || intl.getMessage('editableTable.action.delete', '删除')
  const cancelText = props?.cancelText || intl.getMessage('editableTable.action.cancel', '取消')

  const actionSaveRef = useRefFunction(async (
    recordKey: RecordKey,
    editRow: RecordType & { index?: number },
    originRow: RecordType & { index?: number },
    newLine?: NewLineConfig<RecordType>,
  ) => {
    const res = await props?.onSave?.(recordKey, editRow, originRow, newLine)

    if (res === false)
      return res

    const { options } = newLine || newLineRecordRef.current || ({} as NewLineConfig<RecordType>)
    const isNewLine = !options?.parentKey && isSameRecordKey(options?.recordKey, recordKey)

    if (isNewLine) {
      const mergedRow = normalizeRowDateValues(
        merge<RecordType & { index?: number }>({}, originRow, editRow),
      )
      if (options?.position === 'top')
        props.setDataSource([mergedRow, ...props.dataSource])
      else
        props.setDataSource([...props.dataSource, mergedRow])
    }
    else {
      const actionProps = {
        data: props.dataSource,
        getRowKey: props.getRowKey,
        row: normalizeRowDateValues(
          options
            ? { ...editRow, map_row_parentKey: recordKeyToString(options?.parentKey as RecordKey ?? '')?.toString() }
            : editRow,
        ),
        key: recordKey,
        childrenColumnName: props.childrenColumnName || 'children',
      }
      props.setDataSource(editableRowByKey(actionProps, options?.position === 'top' ? 'top' : 'update'))
    }

    await cancelEditable(recordKey)
    const recordKeyStr = recordKeyToString(recordKey)?.toString()
    if (recordKeyStr)
      preEditRowRefs.current.delete(recordKeyStr)
    return res
  })

  const actionDeleteRef = useRefFunction(async (recordKey: RecordKey, editRow: RecordType & { index?: number }) => {
    const actionProps = {
      data: props.dataSource,
      getRowKey: props.getRowKey,
      row: editRow,
      key: recordKey,
      childrenColumnName: props.childrenColumnName || 'children',
    }
    const res = await props?.onDelete?.(recordKey, editRow)
    if (res === false)
      return false
    await cancelEditable(recordKey, false)
    props.setDataSource(editableRowByKey(actionProps, 'delete'))
    const recordKeyStr = recordKeyToString(recordKey)?.toString()
    if (recordKeyStr)
      preEditRowRefs.current.delete(recordKeyStr)

    return res
  })

  const actionCancelRef = useRefFunction(async (
    recordKey: RecordKey,
    editRow: RecordType & { index?: number },
    originRow: RecordType & { index?: number },
    newLine?: NewLineConfig<RecordType>,
  ) => {
    const res = await props?.onCancel?.(recordKey, editRow, originRow, newLine)
    return res
  })

  const existCustomActionRender = props.actionRender && typeof props.actionRender === 'function'
  const customActionRenderRef = useRefFunction((props.actionRender ?? (() => {})) as ActionRenderFunction<RecordType>)

  const actionRender = (row: RecordType & { index?: number }) => {
    const key = props.getRowKey(row, row.index)
    const config: ActionRenderConfig<any, NewLineConfig<any>> = {
      saveText,
      cancelText,
      deleteText,
      addEditRecord,
      recordKey: key,
      cancelEditable,
      index: row.index,
      tableName: props.tableName,
      newLineConfig: newLineRecordCache.value,
      onCancel: actionCancelRef as any,
      onDelete: actionDeleteRef as any,
      onSave: actionSaveRef as any,
      editableKeys: editableKeys.value,
      setEditableRowKeys,
      preEditRowRef,
      preEditRowRefs,
      deletePopconfirmMessage: props.deletePopconfirmMessage
        || `${intl.getMessage('deleteThisLine', '删除此项')}?`,
    }

    const renderResult = defaultActionRender<RecordType>(row, config)
    // 缓存一下saveRef
    if (props.tableName) {
      saveRefsMap.current.set(
        dataSourceKeyIndexMapRef.current.get(recordKeyToString(key)) || recordKeyToString(key),
        renderResult.saveRef,
      )
    }
    else {
      saveRefsMap.current.set(recordKeyToString(key), renderResult.saveRef)
    }
    if (existCustomActionRender) {
      return customActionRenderRef(row, config, {
        save: renderResult.save,
        delete: renderResult.delete,
        cancel: renderResult.cancel,
      })
    }
    return [renderResult.save, renderResult.delete, renderResult.cancel]
  }

  return {
    get editableKeys() {
      return editableKeys.value
    },
    setEditableRowKeys,
    isEditable,
    actionRender,
    startEditable,
    cancelEditable,
    addEditRecord,
    saveEditable,
    get newLineRecord() {
      return newLineRecordCache.value
    },
    preEditableKeys: editableKeysRef,
    onValuesChange,
    getRealIndex: props.getRealIndex,
    // Vue-only superset key: cellRenderToFromItem.tsx 兜底读取 editableForm?.getFieldValue
    editableForm: props.form,
  }
}

export type UseEditableType<RecordType extends Record<string, any> = any> = typeof useEditableArray<RecordType>

export type UseEditableUtilType<RecordType extends Record<string, any> = any> = ReturnType<typeof useEditableArray<RecordType>>
