import type { VNodeChild } from 'vue'
import type {
  ActionRenderConfig,
  ActionTypeText,
  AddLineOptions,
  NewLineConfig,
  RecordKey,
  RowEditableConfig,
} from '../useEditableArray'
import { computed, ref, watch } from 'vue'
import { useIntl } from '../../provider'
import { defaultActionRender, recordKeyToString } from '../useEditableArray'

export type { AddLineOptions, RecordKey } from '../useEditableArray'

export interface UseEditableMapType<RecordType> {
  dataSource: RecordType
  setDataSource: (data: RecordType | ((data: RecordType) => RecordType)) => void
  editableKeys?: RecordKey[]
  type?: 'single' | 'multiple'
  onCancel?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }, newLineConfig?: NewLineConfig<RecordType>) => Promise<any | void>
  onSave?: (key: RecordKey, record: RecordType & { index?: number }, originRow: RecordType & { index?: number }) => Promise<any | void>
  onValuesChange?: (record: RecordType, dataSource: RecordType) => void
  onChange?: (editableKeys: RecordKey[], editableRows: RecordType | RecordType[]) => void
  actionRender?: RowEditableConfig<RecordType>['actionRender']
  validateEditable?: (recordKey: RecordKey) => Promise<void> | void
  onlyOneLineEditorAlertMessage?: VNodeChild
  deletePopconfirmMessage?: VNodeChild
  saveText?: VNodeChild
  cancelText?: VNodeChild
  deleteText?: VNodeChild
  addEditRecord?: (row: RecordType, options?: AddLineOptions) => boolean
}

export type UseEditableMapUtilType<RecordType extends Record<string, any> = any> = ReturnType<typeof useEditableMap<RecordType>>

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
  const preEditRowMap = new Map<string, (RecordType & { index?: number }) | null>()

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
    props.onChange?.(keys, rows)
  }

  const isEditable = (recordKey: RecordKey) =>
    editableKeys.value.map(recordKeyToString).includes(recordKeyToString(recordKey))

  const startEditable = (recordKey: RecordKey, recordValue?: any) => {
    if (isEditable(recordKey))
      return true
    if ((props.type || 'single') === 'single' && editableKeys.value.length > 0)
      return false
    preEditRowMap.set(recordKeyToString(recordKey), recordValue ?? readValue(props.dataSource, recordKey) ?? null)
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

  const saveEditable = async (
    recordKey: RecordKey,
    editRow?: RecordType & { index?: number },
    originRowFromAction?: RecordType & { index?: number },
  ) => {
    const key = recordKeyToString(recordKey)
    const originRow = originRowFromAction
      || preEditRowMap.get(key)
      || ({ ...props.dataSource } as RecordType)
    const nextRow = editRow || props.dataSource as RecordType & { index?: number }
    try {
      await props.validateEditable?.(recordKey)
    }
    catch {
      return false
    }
    const response = await props.onSave?.(recordKey, nextRow, originRow)
    if (response === false)
      return false
    const nextValue = readValue(nextRow, recordKey)
    props.setDataSource(setValue(
      props.dataSource,
      recordKey,
      nextValue === undefined ? readValue(props.dataSource, recordKey) : nextValue,
    ))
    preEditRowMap.delete(key)
    setEditableRowKeys(editableKeys.value.filter(item => recordKeyToString(item) !== key))
    return true
  }

  const actionRender = (recordKey: RecordKey, config?: ActionTypeText<RecordType>) => {
    const key = recordKeyToString(recordKey)
    const renderConfig: ActionRenderConfig<RecordType> = {
      recordKey,
      cancelEditable,
      onCancel: cancelEditable as any,
      onSave: saveEditable as any,
      editableKeys: editableKeys.value,
      setEditableRowKeys,
      saveText: props.saveText || intl.getMessage('editableTable.action.save', '保存'),
      cancelText: props.cancelText || intl.getMessage('editableTable.action.cancel', '取消'),
      deleteText: props.deleteText ?? false,
      deletePopconfirmMessage: props.deletePopconfirmMessage,
      editorType: 'Map',
      addEditRecord: props.addEditRecord,
      preEditRowRef: { current: preEditRowMap.get(key) || null },
      preEditRowRefs: { current: preEditRowMap as Map<string, RecordType | null> },
      ...config,
    }
    const renderResult = defaultActionRender(props.dataSource, renderConfig)
    const defaultDoms = {
      save: renderResult.save,
      delete: renderResult.delete,
      cancel: renderResult.cancel,
    }
    if (props.actionRender)
      return props.actionRender(props.dataSource, renderConfig, defaultDoms)
    return [
      renderResult.save,
      renderResult.delete,
      renderResult.cancel,
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
