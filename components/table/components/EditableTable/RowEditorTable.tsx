import type { EditableProTableProps, ProColumns } from '../../typing'
import { computed, defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import {
  buildEditableTableRowKey,
  resolveEditingPayloadForRowEditableOnChange,
} from '../../utils'
import EditableProTable from './index'

export const RowEditorTable = defineComponent({
  name: 'RowEditorTable',
  inheritAttrs: false,
  props: [
    'defaultValue',
    'value',
    'onChange',
    'onTableChange',
    'editableFormRef',
    'recordCreatorProps',
    'maxLength',
    'onValuesChange',
    'controlled',
    'formItemProps',
    'actionRef',
    'rowKey',
    'editable',
    'columns',
    'name',
  ],
  setup(rawProps, { attrs }) {
    const props = rawProps as EditableProTableProps<Record<string, any>, any, any>
    const innerEditableKeys = ref<(string | number)[]>((props.editable?.editableKeys || []) as any)
    const blurTimer = ref<ReturnType<typeof setTimeout>>()
    const getRowKey = computed(() => buildEditableTableRowKey(props.rowKey || 'id', props.name))

    watch(
      () => props.editable?.editableKeys?.map(key => String(key)).join(','),
      () => {
        if (props.editable?.editableKeys)
          innerEditableKeys.value = props.editable.editableKeys as any
      },
    )

    onBeforeUnmount(() => {
      if (blurTimer.value)
        clearTimeout(blurTimer.value)
    })

    function setEditableRowKeys(keys: (string | number)[]) {
      const cleanKeys = keys.filter(key => key !== undefined && key !== null)
      if (!props.editable?.editableKeys)
        innerEditableKeys.value = cleanKeys
      props.editable?.onChange?.(
        cleanKeys,
        resolveEditingPayloadForRowEditableOnChange(
          cleanKeys,
          props.value,
          getRowKey.value,
          props.editable?.type,
        ) as any,
      )
    }

    function cancelExitEditing() {
      if (blurTimer.value) {
        clearTimeout(blurTimer.value)
        blurTimer.value = undefined
      }
    }

    function scheduleExitEditing() {
      cancelExitEditing()
      blurTimer.value = setTimeout(() => {
        setEditableRowKeys([])
      }, 150)
    }

    const columns = computed(() => (props.columns || []).map((column: ProColumns<Record<string, any>>) => ({
      ...column,
      onCell: (record: Record<string, any>, rowIndex: number) => {
        const originCellProps = typeof column.onCell === 'function'
          ? column.onCell(record, rowIndex)
          : {}
        const start = () => {
          cancelExitEditing()
          const key = getRowKey.value(record, rowIndex)
          if (key !== undefined && key !== null)
            setEditableRowKeys([key as any])
        }
        return {
          ...originCellProps,
          tabindex: (originCellProps as any)?.tabindex ?? 0,
          onDblclick: start,
          onDoubleClick: start,
          onBlur: (...args: any[]) => {
            ;(originCellProps as any)?.onBlur?.(...args)
            scheduleExitEditing()
          },
          onFocus: (...args: any[]) => {
            ;(originCellProps as any)?.onFocus?.(...args)
            cancelExitEditing()
          },
        }
      },
    })))

    return () => (
      <EditableProTable
        bordered
        pagination={false}
        {...attrs as any}
        {...props as any}
        editable={{
          ...(props.editable || {}),
          editableKeys: props.editable?.editableKeys || innerEditableKeys.value,
        }}
        columns={columns.value as any}
      />
    )
  },
}) as any

export default RowEditorTable
