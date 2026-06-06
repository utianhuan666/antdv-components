import type { VNodeChild } from 'vue'
import type { NewLineConfig, RecordKey } from '../useEditableArray'
import { Button } from 'antdv-next'
import { computed, ref, watch } from 'vue'
import { useIntl } from '../../provider'

export type { RecordKey } from '../useEditableArray'

export interface UseEditableMapType<RecordType> {
  dataSource: RecordType
  setDataSource: (data: RecordType | ((data: RecordType) => RecordType)) => void
  editableKeys?: RecordKey[]
  type?: 'single' | 'multiple'
  onCancel?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onSave?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }) => Promise<any | void>
  onValuesChange?: (record: RecordType, dataSource: RecordType) => void
  onChange?: (editableKeys: RecordKey[], editableRows: RecordType | RecordType[]) => void
  actionRender?: (recordKey: RecordKey, config: { saveText: VNodeChild, cancelText: VNodeChild, deleteText?: VNodeChild | false }) => VNodeChild[]
  validateEditable?: (recordKey: RecordKey) => Promise<void> | void
  onlyOneLineEditorAlertMessage?: VNodeChild
}

export type UseEditableMapUtilType<RecordType extends Record<string, any> = any> = ReturnType<typeof useEditableMap<RecordType>>

function recordKeyToString(recordKey: RecordKey): string {
  return Array.isArray(recordKey) ? recordKey.join(',') : String(recordKey)
}

function readValue(source: any, key: RecordKey) {
  const path = Array.isArray(key) ? key : [key]
  return path.reduce<any>((current, item) => current?.[item], source)
}

function setValue(source: any, key: RecordKey, value: any) {
  const path = Array.isArray(key) ? key : [key]
  const last = path[path.length - 1]
  if (last === undefined)
    return source
  const next = { ...(source || {}) }
  let cursor = next
  path.slice(0, -1).forEach((item, index) => {
    const nextKey = path[index + 1]
    cursor[item] = cursor[item] && typeof cursor[item] === 'object'
      ? { ...cursor[item] }
      : typeof nextKey === 'number' ? [] : {}
    cursor = cursor[item]
  })
  cursor[last] = value
  return next
}

export function useEditableMap<RecordType extends Record<string, any>>(props: UseEditableMapType<RecordType>) {
  const intl = useIntl()
  const innerEditableKeys = ref<RecordKey[]>(props.editableKeys || [])
  const preEditRowMap = new Map<string, RecordType & { index?: number }>()

  watch(
    () => props.editableKeys?.map(recordKeyToString).join(';'),
    () => {
      if (props.editableKeys)
        innerEditableKeys.value = props.editableKeys
    },
  )

  const editableKeys = computed(() => props.editableKeys || innerEditableKeys.value)
  const setEditableRowKeys = (keys: RecordKey[]) => {
    if (!props.editableKeys)
      innerEditableKeys.value = keys
    const rows = keys.map(key => readValue(props.dataSource, key)).filter(Boolean) as RecordType[]
    props.onChange?.(keys, props.type === 'multiple' ? rows : (rows[0] || props.dataSource))
  }

  const isEditable = (recordKey: RecordKey) =>
    editableKeys.value.map(recordKeyToString).includes(recordKeyToString(recordKey))

  const startEditable = (recordKey: RecordKey, recordValue?: any) => {
    if (isEditable(recordKey))
      return true
    if ((props.type || 'single') === 'single' && editableKeys.value.length > 0)
      return false
    preEditRowMap.set(recordKeyToString(recordKey), { ...props.dataSource })
    setEditableRowKeys([...(props.type === 'multiple' ? editableKeys.value : []), recordKey])
    if (recordValue !== undefined)
      props.onValuesChange?.(setValue(props.dataSource, recordKey, recordValue), props.dataSource)
    return true
  }

  const cancelEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const originRow = preEditRowMap.get(key) || ({ ...props.dataSource } as RecordType)
    try {
      await props.onCancel?.(recordKey, props.dataSource as RecordType & { index?: number }, originRow, undefined)
    }
    finally {
      preEditRowMap.delete(key)
      setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    }
  }

  const saveEditable = async (recordKey: RecordKey) => {
    const key = recordKeyToString(recordKey)
    const originRow = preEditRowMap.get(key) || ({ ...props.dataSource } as RecordType)
    try {
      await props.validateEditable?.(recordKey)
    }
    catch {
      return false
    }
    const response = await props.onSave?.(recordKey, props.dataSource as RecordType & { index?: number }, originRow)
    if (response === false)
      return false
    preEditRowMap.delete(key)
    setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    return true
  }

  const actionRender = (recordKey: RecordKey, config?: { saveText: VNodeChild, cancelText: VNodeChild, deleteText?: VNodeChild | false }) => {
    if (props.actionRender) {
      return props.actionRender(recordKey, config || {
        saveText: intl.getMessage('editableTable.action.save', '保存'),
        cancelText: intl.getMessage('editableTable.action.cancel', '取消'),
        deleteText: false,
      })
    }
    return [
      <Button type="link" size="small" onClick={() => saveEditable(recordKey)}>{config?.saveText ?? intl.getMessage('editableTable.action.save', '保存')}</Button>,
      <Button type="link" size="small" onClick={() => cancelEditable(recordKey)}>{config?.cancelText ?? intl.getMessage('editableTable.action.cancel', '取消')}</Button>,
    ]
  }

  return {
    get editableKeys() {
      return editableKeys.value
    },
    setEditableRowKeys,
    isEditable,
    startEditable,
    cancelEditable,
    saveEditable,
    actionRender,
  }
}
