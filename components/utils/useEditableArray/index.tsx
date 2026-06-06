import type { VNodeChild } from 'vue'
import { get } from '@v-c/util'
import { cloneDeep } from 'es-toolkit'
import { computed, ref, watch } from 'vue'
import { useIntl } from '../../provider'

export type RecordKey = string | number | (string | number)[]

export interface AddLineOptions {
  position?: 'top' | 'bottom'
  recordKey?: RecordKey
  newRecordType?: 'dataSource' | 'cache'
  parentKey?: RecordKey | (() => RecordKey)
}

export interface NewLineConfig<RecordType> {
  defaultValue?: RecordType
  options: AddLineOptions
}

export type RowEditableType = 'single' | 'multiple'

export interface ActionTypeText<T> {
  deleteText?: VNodeChild
  cancelText?: VNodeChild
  saveText?: VNodeChild
  editorType?: 'Array' | 'Map'
  addEditRecord?: (row: T, options?: AddLineOptions) => boolean
}

export type ActionRenderConfig<T, LineConfig = NewLineConfig<T>> = {
  editableKeys?: RecordKey[]
  recordKey: RecordKey
  preEditRowRef: { current: T | null }
  preEditRowRefs?: { current: Map<string, T | null> }
  index?: number
  cancelEditable: (key: RecordKey) => void | Promise<void | boolean>
  onSave: RowEditableConfig<T>['onSave']
  onCancel: RowEditableConfig<T>['onCancel']
  onDelete?: RowEditableConfig<T>['onDelete']
  deletePopconfirmMessage?: RowEditableConfig<T>['deletePopconfirmMessage']
  setEditableRowKeys: (value: RecordKey[]) => void
  newLineConfig?: LineConfig
  tableName?: RecordKey
  children?: VNodeChild
} & ActionTypeText<T>

export type ActionRenderFunction<T> = (
  row: T,
  config: ActionRenderConfig<T, NewLineConfig<T>>,
  defaultDoms: {
    save: VNodeChild
    delete: VNodeChild
    cancel: VNodeChild
  },
) => VNodeChild[]

export interface RowEditableConfig<RecordType> {
  formProps?: Record<string, any>
  form?: any
  type?: RowEditableType
  editableKeys?: RecordKey[]
  onChange?: (editableKeys: RecordKey[], editableRows: RecordType[] | RecordType) => void
  onSave?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onCancel?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onDelete?: (key: RecordKey, row: RecordType & { index?: number }) => Promise<any | void>
  onValuesChange?: (record: RecordType, dataSource: RecordType[]) => void
  actionRender?: ActionRenderFunction<RecordType>
  deletePopconfirmMessage?: VNodeChild
  onlyOneLineEditorAlertMessage?: VNodeChild
  onlyAddOneLineAlertMessage?: VNodeChild
  tableName?: RecordKey
  saveText?: VNodeChild
  cancelText?: VNodeChild
  deleteText?: VNodeChild
  getRealIndex?: (record: RecordType) => number
  dateFormatter?: string | 'string' | 'number' | false | ((value: any, valueType: string) => string | number)
}

export type UseEditableType<RecordType> = RowEditableConfig<RecordType> & {
  dataSource: RecordType[]
  setDataSource: (data: RecordType[] | ((data: RecordType[]) => RecordType[])) => void
  getRowKey: (record: RecordType, index?: number) => string | number
  form?: any
  childrenColumnName?: string
  columns?: any[]
}

export type UseEditableUtilType<RecordType extends Record<string, any> = any> = ReturnType<typeof useEditableArray<RecordType>>

export function recordKeyToString(recordKey: RecordKey): string {
  return Array.isArray(recordKey) ? recordKey.join(',') : String(recordKey)
}

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

export interface SaveEditableActionRef<T = any> {
  save: () => ReturnType<NonNullable<RowEditableConfig<T>['onSave']>> | Promise<void>
}

export function SaveEditableAction<T>(
  props: ActionRenderConfig<T> & { row: T, onClick?: () => void | Promise<void> },
) {
  const save = async (event?: Event) => {
    event?.stopPropagation?.()
    event?.preventDefault?.()
    if (props.onClick) {
      await props.onClick()
      return
    }
    await props.onSave?.(
      props.recordKey,
      props.row as T & { index?: number },
      (props.preEditRowRef.current || props.row) as T & { index?: number },
      props.newLineConfig,
    )
  }
  return <a key="save" onClick={save}>{props.children || props.saveText || '保存'}</a>
}

export function DeleteEditableAction<T>(
  props: ActionRenderConfig<T> & { row: T, onClick?: () => void | Promise<void> },
) {
  if (props.children === false)
    return null
  const remove = async (event?: Event) => {
    event?.stopPropagation?.()
    event?.preventDefault?.()
    if (props.onClick) {
      await props.onClick()
      return
    }
    await props.onDelete?.(props.recordKey, props.row as T & { index?: number })
  }
  return <a key="delete" onClick={remove}>{props.children || props.deleteText || '删除'}</a>
}

export function defaultActionRender<T>(row: T, config: ActionRenderConfig<T>) {
  const saveRef: { current: SaveEditableActionRef<T> | null } = {
    current: {
      save: async () => {
        await config.onSave?.(
          config.recordKey,
          row as T & { index?: number },
          (config.preEditRowRef.current || row) as T & { index?: number },
          config.newLineConfig,
        )
      },
    },
  }
  const save = SaveEditableAction({ ...config, row })
  const deleteDom = DeleteEditableAction({ ...config, row })
  const cancel = (
    <a
      key="cancel"
      onClick={(event: Event) => {
        event.stopPropagation()
        event.preventDefault()
        config.cancelEditable(config.recordKey)
      }}
    >
      {config.cancelText || '取消'}
    </a>
  )
  return { save, delete: deleteDom, cancel, saveRef }
}

function setPathValue(source: any, path: (string | number)[], value: any) {
  if (!path.length)
    return value
  let cursor = source
  path.slice(0, -1).forEach((key, index) => {
    const nextKey = path[index + 1]
    if (cursor[key] == null || typeof cursor[key] !== 'object')
      cursor[key] = typeof nextKey === 'number' ? [] : {}
    cursor = cursor[key]
  })
  const lastKey = path[path.length - 1]
  if (lastKey !== undefined)
    cursor[lastKey] = value
  return source
}

function patchDataSource<RecordType>(
  dataSource: RecordType[],
  setDataSource: UseEditableType<RecordType>['setDataSource'],
  updater: (data: RecordType[]) => RecordType[],
) {
  setDataSource((old: RecordType[]) => updater(Array.isArray(old) ? old : dataSource) as RecordType[])
}

function normalizeRowForDataSource<RecordType extends Record<string, any>>(
  row: RecordType,
  defaultValue?: RecordType,
): RecordType {
  const next = cloneDeep({
    ...(defaultValue || {}),
    ...(row || {}),
  })
  delete (next as any).index
  return next
}

function resolveParentKey(parentKey?: AddLineOptions['parentKey']) {
  return typeof parentKey === 'function' ? (parentKey as any)() : parentKey
}

function insertRecordByOptions<RecordType extends Record<string, any>>(
  dataSource: RecordType[],
  row: RecordType,
  options: AddLineOptions,
  getRowKey: UseEditableType<RecordType>['getRowKey'],
  childrenColumnName = 'children',
): RecordType[] {
  const position = options.position === 'top' ? 'top' : 'bottom'
  const parentKey = resolveParentKey(options.parentKey)

  if (parentKey == null) {
    return position === 'top' ? [row, ...dataSource] : [...dataSource, row]
  }

  const parentKeyString = recordKeyToString(parentKey)
  let inserted = false
  const insertIntoChildren = (records: RecordType[]): RecordType[] => {
    return records.map((record, index) => {
      const children = (record as any)?.[childrenColumnName]
      if (String(getRowKey(record, index)) === parentKeyString) {
        inserted = true
        const nextChildren = Array.isArray(children) ? [...children] : []
        const nextRow = {
          ...row,
          map_row_parentKey: parentKeyString,
        }
        return {
          ...record,
          [childrenColumnName]: position === 'top'
            ? [nextRow, ...nextChildren]
            : [...nextChildren, nextRow],
        }
      }
      if (Array.isArray(children)) {
        return {
          ...record,
          [childrenColumnName]: insertIntoChildren(children),
        }
      }
      return record
    })
  }

  const nextDataSource = insertIntoChildren(dataSource)
  return inserted ? nextDataSource : dataSource
}

function updateRecordByKey<RecordType extends Record<string, any>>(
  dataSource: RecordType[],
  recordKey: RecordKey,
  row: RecordType,
  getRowKey: UseEditableType<RecordType>['getRowKey'],
  childrenColumnName = 'children',
): RecordType[] {
  const key = recordKeyToString(Array.isArray(recordKey) ? recordKey[0]! : recordKey)
  return dataSource.map((record, index) => {
    const children = (record as any)?.[childrenColumnName]
    if (String(getRowKey(record, index)) === key) {
      return {
        ...record,
        ...row,
        ...(children !== undefined && (row as any)[childrenColumnName] === undefined
          ? { [childrenColumnName]: children }
          : {}),
      }
    }
    if (Array.isArray(children)) {
      return {
        ...record,
        [childrenColumnName]: updateRecordByKey(
          children,
          recordKey,
          row,
          getRowKey,
          childrenColumnName,
        ),
      }
    }
    return record
  })
}

function deleteRecordByKey<RecordType extends Record<string, any>>(
  dataSource: RecordType[],
  recordKey: RecordKey,
  getRowKey: UseEditableType<RecordType>['getRowKey'],
  childrenColumnName = 'children',
): RecordType[] {
  const key = recordKeyToString(Array.isArray(recordKey) ? recordKey[0]! : recordKey)
  return dataSource
    .filter((record, index) => String(getRowKey(record, index)) !== key)
    .map((record) => {
      const children = (record as any)?.[childrenColumnName]
      if (Array.isArray(children)) {
        return {
          ...record,
          [childrenColumnName]: deleteRecordByKey(
            children,
            recordKey,
            getRowKey,
            childrenColumnName,
          ),
        }
      }
      return record
    })
}

function flattenColumns(columns: any[] = []): any[] {
  return columns.flatMap(column => [column, ...flattenColumns(column?.children || [])])
}

export function editableRowByKey<RecordType>(
  key: RecordKey,
  data: RecordType[],
  getRowKey: (record: RecordType, index?: number) => string | number,
  childrenColumnName = 'children',
): (RecordType & { index?: number }) | undefined {
  const keyString = recordKeyToString(Array.isArray(key) ? key[0]! : key)
  for (let index = 0; index < data.length; index += 1) {
    const record = data[index] as RecordType & { [key: string]: any }
    if (String(getRowKey(record, index)) === keyString)
      return { ...(record as any), index }
    const children = record?.[childrenColumnName]
    if (Array.isArray(children)) {
      const found = editableRowByKey(key, children, getRowKey as any, childrenColumnName)
      if (found)
        return found
    }
  }
  return undefined
}

export function useEditableArray<RecordType extends Record<string, any>>(props: UseEditableType<RecordType>) {
  const intl = useIntl()
  const innerEditableKeys = ref<RecordKey[]>(props.editableKeys || [])
  const preEditRowMap = new Map<string, RecordType & { index?: number }>()
  const newLineRecord = ref<NewLineConfig<RecordType> | undefined>()

  watch(
    () => props.editableKeys?.map(recordKeyToString).join(';'),
    () => {
      if (props.editableKeys)
        innerEditableKeys.value = props.editableKeys
    },
  )

  const editableKeys = computed(() => props.editableKeys || innerEditableKeys.value)

  const getEditableRows = (keys: RecordKey[]) =>
    keys
      .map(key => editableRowByKey(key, props.dataSource, props.getRowKey, props.childrenColumnName))
      .filter(Boolean) as RecordType[]

  const getRealIndex = (record: RecordType) => {
    if (props.getRealIndex)
      return props.getRealIndex(record)
    const key = props.getRowKey(record)
    return props.dataSource.findIndex((item, index) => String(props.getRowKey(item, index)) === String(key))
  }

  const updateEditableRow = (recordKey: RecordKey, dataIndex: RecordKey, value: any) => {
    const key = recordKeyToString(recordKey)
    let changedRecord: RecordType | undefined
    patchDataSource(props.dataSource, props.setDataSource, data => data.map((item, index) => {
      if (String(props.getRowKey(item, index)) !== key)
        return item
      const next = cloneDeep(item)
      setPathValue(next, Array.isArray(dataIndex) ? dataIndex : [dataIndex], value)
      changedRecord = next
      return next
    }))
    const nextDataSource = props.dataSource.map((item, index) => {
      if (String(props.getRowKey(item, index)) !== key)
        return item
      return changedRecord || item
    })
    if (changedRecord)
      props.onValuesChange?.(changedRecord, nextDataSource)
    if (changedRecord) {
      const changedPath = Array.isArray(dataIndex) ? dataIndex.join('.') : String(dataIndex)
      flattenColumns(props.columns).forEach((column) => {
        const dependencies = [column?.dependencies].flat(2).filter(Boolean).map(String)
        if (typeof column?.request === 'function' && dependencies.includes(changedPath))
          column.request(changedRecord, column)
      })
    }
  }

  const setEditableRowKeys = (keys: RecordKey[]) => {
    if (!props.editableKeys)
      innerEditableKeys.value = keys
    props.onChange?.(keys, getEditableRows(keys))
  }

  const isEditable = (recordKey: RecordKey | (RecordType & { index?: number })) => {
    const keys = editableKeys.value.map(recordKeyToString)
    if (recordKey && typeof recordKey === 'object' && !Array.isArray(recordKey)) {
      const rowKey = props.getRowKey(recordKey as RecordType, (recordKey as any).index)
      const idKey = (recordKey as any).id
      return keys.includes(recordKeyToString(rowKey)) || (idKey !== undefined && keys.includes(recordKeyToString(idKey)))
    }
    return keys.includes(recordKeyToString(recordKey as RecordKey))
  }

  const startEditable = (recordKey: RecordKey, record?: RecordType) => {
    if (isEditable(recordKey))
      return true
    if ((props.type || 'single') === 'single' && editableKeys.value.length > 0)
      return false
    const row = record || editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
    if (row) {
      const originRow = cloneDeep(row)
      delete (originRow as any).index
      preEditRowMap.set(recordKeyToString(recordKey), originRow)
    }
    setEditableRowKeys([...(props.type === 'multiple' ? editableKeys.value : []), recordKey])
    return true
  }

  const cancelEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const currentNewLine = newLineRecord.value && recordKeyToString(newLineRecord.value.options.recordKey ?? '') === key ? newLineRecord.value : undefined
    const current = editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
      || currentNewLine?.defaultValue as RecordType & { index?: number }
      || ({} as RecordType & { index?: number })
    const originRow = preEditRowMap.has(key)
      ? preEditRowMap.get(key)!
      : cloneDeep(current)
    try {
      await props.onCancel?.(recordKey, current, originRow, currentNewLine)
    }
    finally {
      if (currentNewLine) {
        newLineRecord.value = undefined
      }
      preEditRowMap.delete(key)
      setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    }
  }

  const saveEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const currentNewLine = newLineRecord.value && recordKeyToString(newLineRecord.value.options.recordKey ?? '') === key ? newLineRecord.value : undefined
    const current = editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
      || currentNewLine?.defaultValue as RecordType & { index?: number }
      || ({} as RecordType & { index?: number })
    const originRow = preEditRowMap.has(key)
      ? preEditRowMap.get(key)!
      : cloneDeep(current)
    if (Array.isArray(recordKey) && recordKey.length > 1) {
      const [, ...recordKeyPath] = recordKey
      const curValue = get(current, recordKeyPath)
      setPathValue(current, recordKeyPath, curValue)
    }
    const response = await props.onSave?.(recordKey, current, originRow, currentNewLine)
    if (response === false)
      return false
    if (currentNewLine) {
      patchDataSource(props.dataSource, props.setDataSource, data =>
        insertRecordByOptions(
          data,
          normalizeRowForDataSource(current, currentNewLine.defaultValue),
          currentNewLine.options,
          props.getRowKey,
          props.childrenColumnName || 'children',
        ))
    }
    else {
      patchDataSource(props.dataSource, props.setDataSource, data =>
        updateRecordByKey(
          data,
          recordKey,
          current,
          props.getRowKey,
          props.childrenColumnName || 'children',
        ))
    }
    preEditRowMap.delete(key)
    newLineRecord.value = undefined
    setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    return true
  }

  const deleteEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const current = editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
    if (!current)
      return false
    const response = await props.onDelete?.(recordKey, current)
    if (response === false)
      return false
    patchDataSource(props.dataSource, props.setDataSource, data =>
      deleteRecordByKey(data, key, props.getRowKey, props.childrenColumnName || 'children'))
    setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    return true
  }

  const addEditRecord = (record: RecordType, options: NewLineConfig<RecordType>['options'] = {}) => {
    const recordKey = options.recordKey ?? props.getRowKey(record, props.dataSource.length)
    newLineRecord.value = { options: { ...options, recordKey }, defaultValue: record }
    preEditRowMap.set(recordKeyToString(recordKey), record)
    const isDataSourceMode = options.newRecordType === 'dataSource'
      || (props.tableName && options.newRecordType !== 'cache')
    if (isDataSourceMode) {
      patchDataSource(props.dataSource, props.setDataSource, data =>
        insertRecordByOptions(
          data,
          record,
          { ...options, recordKey },
          props.getRowKey,
          props.childrenColumnName || 'children',
        ))
    }
    if (!isEditable(recordKey))
      setEditableRowKeys([...(props.type === 'multiple' ? editableKeys.value : []), recordKey])
    return true
  }

  const actionRender = (recordOrKey: (RecordType & { index?: number }) | RecordKey) => {
    const recordKey = typeof recordOrKey === 'object' && !Array.isArray(recordOrKey)
      ? props.getRowKey(recordOrKey as RecordType, (recordOrKey as any).index)
      : recordOrKey as RecordKey
    const record = typeof recordOrKey === 'object' && !Array.isArray(recordOrKey)
      ? recordOrKey as RecordType & { index?: number }
      : editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
    const key = recordKeyToString(recordKey)
    const config: ActionRenderConfig<RecordType> = {
      recordKey,
      index: record?.index,
      editableKeys: editableKeys.value,
      setEditableRowKeys,
      cancelEditable,
      onCancel: cancelEditable as any,
      onDelete: deleteEditable as any,
      onSave: saveEditable as any,
      preEditRowRef: { current: preEditRowMap.get(key) || null },
      newLineConfig: newLineRecord.value,
      tableName: props.tableName,
      saveText: props.saveText || intl.getMessage('editableTable.action.save', '保存'),
      deleteText: props.deleteText || intl.getMessage('editableTable.action.delete', '删除'),
      cancelText: props.cancelText || intl.getMessage('editableTable.action.cancel', '取消'),
      deletePopconfirmMessage: props.deletePopconfirmMessage,
      addEditRecord,
    }
    const renderResult = defaultActionRender(record || ({} as RecordType), config)
    const defaultDoms = {
      save: renderResult.save,
      delete: renderResult.delete,
      cancel: renderResult.cancel,
    }
    return props.actionRender?.(record || ({} as RecordType), config, defaultDoms) ?? [
      renderResult.save,
      renderResult.delete,
      renderResult.cancel,
    ]
  }

  return {
    props,
    editableForm: props.form,
    get editableKeys() {
      return editableKeys.value
    },
    get newLineRecord() {
      return newLineRecord.value
    },
    setEditableRowKeys,
    getRealIndex,
    updateEditableRow,
    isEditable,
    startEditable,
    cancelEditable,
    saveEditable,
    deleteEditable,
    addEditRecord,
    actionRender,
  }
}
