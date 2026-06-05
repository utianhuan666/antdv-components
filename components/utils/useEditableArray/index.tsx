import type { VNodeChild } from 'vue'
import { Button } from 'antdv-next'
import { computed, ref, watch } from 'vue'
import { useIntl } from '../../provider'
import { cloneDeep, getValue, setValue } from '../path'

export type RecordKey = string | number | (string | number)[]

export interface NewLineConfig<RecordType> {
  options: {
    recordKey?: RecordKey
    newRecordType?: 'dataSource' | 'cache'
    parentKey?: RecordKey
    position?: 'top' | 'bottom'
  }
  defaultValue: RecordType
}

export type RowEditableType = 'single' | 'multiple'

export interface RowEditableConfig<RecordType> {
  type?: RowEditableType
  editableKeys?: RecordKey[]
  onChange?: (editableKeys: RecordKey[], editableRows: RecordType[]) => void
  onSave?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onCancel?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onDelete?: (key: RecordKey, row: RecordType & { index?: number }) => Promise<any | void>
  onValuesChange?: (record: RecordType, dataSource: RecordType[]) => void
  actionRender?: (...args: any[]) => VNodeChild[]
  onlyOneLineEditorAlertMessage?: VNodeChild
}

export type UseEditableType<RecordType> = RowEditableConfig<RecordType> & {
  dataSource: RecordType[]
  setDataSource: (data: RecordType[] | ((data: RecordType[]) => RecordType[])) => void
  getRowKey: (record: RecordType, index?: number) => string | number
  childrenColumnName?: string
  tableName?: string
}

export type UseEditableUtilType<RecordType extends Record<string, any> = any> = ReturnType<typeof useEditableArray<RecordType>>

export function recordKeyToString(recordKey: RecordKey): string {
  return Array.isArray(recordKey) ? recordKey.join(',') : String(recordKey)
}

function patchDataSource<RecordType>(
  dataSource: RecordType[],
  setDataSource: UseEditableType<RecordType>['setDataSource'],
  updater: (data: RecordType[]) => RecordType[],
) {
  setDataSource((old: RecordType[]) => updater(Array.isArray(old) ? old : dataSource) as RecordType[])
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

  const setEditableRowKeys = (keys: RecordKey[]) => {
    if (!props.editableKeys)
      innerEditableKeys.value = keys
    props.onChange?.(keys, getEditableRows(keys))
  }

  const isEditable = (recordKey: RecordKey) =>
    editableKeys.value.map(recordKeyToString).includes(recordKeyToString(recordKey))

  const startEditable = (recordKey: RecordKey, record?: RecordType) => {
    if (isEditable(recordKey))
      return true
    if ((props.type || 'single') === 'single' && editableKeys.value.length > 0)
      return false
    const row = record || editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName)
    if (row)
      preEditRowMap.set(recordKeyToString(recordKey), cloneDeep(row))
    setEditableRowKeys([...(props.type === 'multiple' ? editableKeys.value : []), recordKey])
    return true
  }

  const cancelEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const current = editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName) || ({} as RecordType & { index?: number })
    const originRow = preEditRowMap.get(key) || cloneDeep(current)
    const currentNewLine = newLineRecord.value && recordKeyToString(newLineRecord.value.options.recordKey ?? '') === key ? newLineRecord.value : undefined
    try {
      await props.onCancel?.(recordKey, current, originRow, currentNewLine)
    }
    finally {
      if (currentNewLine?.options.newRecordType === 'cache') {
        patchDataSource(props.dataSource, props.setDataSource, data =>
          data.filter((item, index) => String(props.getRowKey(item, index)) !== key))
        newLineRecord.value = undefined
      }
      preEditRowMap.delete(key)
      setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    }
  }

  const saveEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const current = editableRowByKey(recordKey, props.dataSource, props.getRowKey, props.childrenColumnName) || ({} as RecordType & { index?: number })
    const originRow = preEditRowMap.get(key) || cloneDeep(current)
    const currentNewLine = newLineRecord.value && recordKeyToString(newLineRecord.value.options.recordKey ?? '') === key ? newLineRecord.value : undefined
    if (Array.isArray(recordKey) && recordKey.length > 1) {
      const [, ...recordKeyPath] = recordKey
      const curValue = getValue(current, recordKeyPath)
      setValue(current, recordKeyPath, curValue)
    }
    const response = await props.onSave?.(recordKey, current, originRow, currentNewLine)
    if (response === false)
      return false
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
      data.filter((item, index) => String(props.getRowKey(item, index)) !== key))
    setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    return true
  }

  const addEditRecord = (record: RecordType, options: NewLineConfig<RecordType>['options'] = {}) => {
    const recordKey = options.recordKey ?? props.getRowKey(record, props.dataSource.length)
    newLineRecord.value = { options: { ...options, recordKey }, defaultValue: record }
    patchDataSource(props.dataSource, props.setDataSource, data =>
      options.position === 'top' ? [record, ...data] : [...data, record])
    startEditable(recordKey, record)
  }

  const actionRender = (recordOrKey: (RecordType & { index?: number }) | RecordKey) => {
    const recordKey = typeof recordOrKey === 'object' && !Array.isArray(recordOrKey)
      ? props.getRowKey(recordOrKey as RecordType, (recordOrKey as any).index)
      : recordOrKey as RecordKey
    return [
      <Button type="link" size="small" onClick={() => saveEditable(recordKey)}>{intl.getMessage('editableTable.action.save', '保存')}</Button>,
      <Button type="link" size="small" onClick={() => deleteEditable(recordKey)}>{intl.getMessage('editableTable.action.delete', '删除')}</Button>,
      <Button type="link" size="small" onClick={() => cancelEditable(recordKey)}>{intl.getMessage('editableTable.action.cancel', '取消')}</Button>,
    ]
  }

  return {
    get editableKeys() {
      return editableKeys.value
    },
    get newLineRecord() {
      return newLineRecord.value
    },
    setEditableRowKeys,
    isEditable,
    startEditable,
    cancelEditable,
    saveEditable,
    deleteEditable,
    addEditRecord,
    actionRender,
  }
}
