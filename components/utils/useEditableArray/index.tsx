import type { VNodeChild } from 'vue'
import { LoadingOutlined } from '@antdv-next/icons'
import { get } from '@v-c/util'
import { message, Popconfirm } from 'antdv-next'
import { cloneDeep } from 'es-toolkit'
import { computed, defineComponent, ref, watch } from 'vue'
import { useIntl } from '../../provider'
import { conversionMomentValue } from '../conversionMomentValue'
import { useDebounceFn } from '../hooks/useDebounceFn'

/**
 * 显示警告信息
 */
function warning(messageStr: VNodeChild) {
  return message.warning(messageStr as any)
}

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

export const SaveEditableAction = defineComponent({
  name: 'SaveEditableAction',
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const loading = ref(false)
    const save = async (event?: Event) => {
      const c = props.config as ActionRenderConfig<any> & { row: any, children?: any, onClick?: () => void | Promise<void> }
      event?.stopPropagation?.()
      event?.preventDefault?.()
      try {
        loading.value = true
        if (c.onClick) {
          await c.onClick()
          return
        }
        await c.onSave?.(
          c.recordKey,
          c.row,
          c.preEditRowRef?.current || c.row,
          c.newLineConfig,
        )
      }
      finally {
        loading.value = false
      }
    }
    return () => {
      const c = props.config as ActionRenderConfig<any> & { row: any, children?: any }
      return (
        <a key="save" onClick={save}>
          {loading.value ? <LoadingOutlined style={{ marginInlineEnd: '8px' }} /> : null}
          {c.children || c.saveText || '保存'}
        </a>
      )
    }
  },
})

export const DeleteEditableAction = defineComponent({
  name: 'DeleteEditableAction',
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const loading = ref(false)
    const onConfirm = async () => {
      const c = props.config as ActionRenderConfig<any> & { row: any, onClick?: () => void | Promise<void> }
      try {
        loading.value = true
        if (c.onClick) {
          await c.onClick()
          return
        }
        const res = await c.onDelete?.(c.recordKey, c.row)
        if (res === false)
          return false
        return res
      }
      finally {
        loading.value = false
        const keyStr = String(recordKeyToString(c.recordKey))
        c.preEditRowRefs?.current?.delete(keyStr)
        if (c.preEditRowRef)
          c.preEditRowRef.current = null
      }
    }
    return () => {
      const c = props.config as ActionRenderConfig<any> & { row: any, children?: any }
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
  const keyStr = recordKeyToString(config.recordKey)
  // 与 React 对齐：新增行不渲染删除按钮（取消即删除）
  const isNewLine = config.newLineConfig != null
    && isSameRecordKey(config.newLineConfig.options.recordKey, config.recordKey)
  const save = <SaveEditableAction key={`save${keyStr}`} config={{ ...config, row, children: config.saveText }} />
  const deleteDom = isNewLine
    ? undefined
    : <DeleteEditableAction key={`delete${keyStr}`} config={{ ...config, row, children: config.deleteText }} />
  const cancel = (
    <a
      key={`cancel${keyStr}`}
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

  const normalizeRowDateValues = (row: RecordType | null | undefined): RecordType => {
    if (row == null || typeof row !== 'object')
      return row as unknown as RecordType
    return conversionMomentValue(row, props.dateFormatter ?? 'string', {}, false) as RecordType
  }

  const propsOnValuesChange = useDebounceFn((record: RecordType, dataSource: RecordType[]) => {
    props.onValuesChange?.(record, dataSource)
  }, 64)

  const resolveFormInstance = (): any => {
    const formRef = props.formProps?.formRef
    return formRef?.value ?? formRef?.current ?? props.form
  }

  const validateRowFields = async (recordKey: RecordKey): Promise<void> => {
    const form = resolveFormInstance()
    if (!form || typeof form.validateFields !== 'function')
      return
    // 为了兼容类型为 array 的 dataIndex，当 recordKey 是数组时只取第一项作为表单字段路径
    const namePath = [props.tableName ?? '', Array.isArray(recordKey) ? recordKey[0] : recordKey]
      .flat(1)
      .filter(pathKey => pathKey || pathKey === 0)
    await form.validateFields(namePath, { recursive: true })
  }

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

  const buildFormFieldPath = (recordKey: string): (string | number)[] =>
    [props.tableName ?? '', recordKey].flat(1).filter(key => key || key === 0) as (string | number)[]

  const updateDataSourceWithEditableRows = (dataSource: RecordType[], values: any): RecordType[] => {
    let updatedDataSource = dataSource
    editableKeys.value.forEach((eachRecordKey) => {
      if (newLineRecord.value && isSameRecordKey(newLineRecord.value.options.recordKey, eachRecordKey))
        return
      const recordKey = recordKeyToString(eachRecordKey)
      const editRow = get(values, buildFormFieldPath(String(recordKey)))
      if (!editRow)
        return
      updatedDataSource = updateRecordByKey(
        updatedDataSource,
        recordKey,
        normalizeRowDateValues(editRow),
        props.getRowKey,
        props.childrenColumnName || 'children',
      )
    })
    return updatedDataSource
  }

  const getCurrentEditRow = (value: any, values: any, dataSource: RecordType[]): RecordType => {
    const valueKeys = Object.keys(value || {})
    if (valueKeys.length === 0)
      return (newLineRecord.value?.defaultValue || {}) as RecordType
    const recordKey = String(valueKeys[valueKeys.length - 1] ?? '')
    if (!recordKey)
      return (newLineRecord.value?.defaultValue || {}) as RecordType
    const newLineRecordData = normalizeRowDateValues({
      ...newLineRecord.value?.defaultValue,
      ...get(values, buildFormFieldPath(recordKey)),
    } as RecordType)
    const found = editableRowByKey(recordKey, dataSource, props.getRowKey, props.childrenColumnName)
    return (found || newLineRecordData) as RecordType
  }

  const onValuesChange = (value: RecordType, values: RecordType) => {
    if (!props.onValuesChange)
      return
    const updatedDataSource = updateDataSourceWithEditableRows(props.dataSource, values)
    const editRow = getCurrentEditRow(value, values, updatedDataSource)
    propsOnValuesChange.run(editRow, updatedDataSource)
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
      propsOnValuesChange.run(changedRecord, nextDataSource)
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

  const validateCanStartEdit = (): boolean => {
    const hasEditableKeys = editableKeys.value.length > 0
    if (
      hasEditableKeys
      && (props.type || 'single') === 'single'
      && props.onlyOneLineEditorAlertMessage !== false
    ) {
      warning(
        props.onlyOneLineEditorAlertMessage
        || intl.getMessage('editableTable.onlyOneLineEditor', '只能同时编辑一行'),
      )
      return false
    }
    return true
  }

  const startEditable = (recordKey: RecordKey, record?: RecordType) => {
    if (isEditable(recordKey))
      return true
    if (!validateCanStartEdit())
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
    try {
      await validateRowFields(recordKey)
    }
    catch {
      // 校验失败时中止保存；表单会自动展示对应字段的错误信息
      return false
    }
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
          normalizeRowDateValues(normalizeRowForDataSource(current, currentNewLine.defaultValue)),
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
          normalizeRowDateValues(current),
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
    if (newLineRecord.value && props.onlyAddOneLineAlertMessage !== false) {
      warning(
        props.onlyAddOneLineAlertMessage
        || intl.getMessage('editableTable.onlyAddOneLine', '只能新增一行'),
      )
      return false
    }
    if (!validateCanStartEdit())
      return false
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
    onValuesChange,
    isEditable,
    startEditable,
    cancelEditable,
    saveEditable,
    deleteEditable,
    addEditRecord,
    actionRender,
  }
}
