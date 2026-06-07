import type { EditableFormInstance, EditableProTableProps } from '../../typing'
import { PlusOutlined } from '@antdv-next/icons'
import { Button } from 'antdv-next'
import { cloneDeep } from 'es-toolkit'
import { computed, defineComponent, ref, watch, watchEffect } from 'vue'
import { useFieldContext } from '../../../form/FieldContext'
import { getValueByNamePath, runFunction, setValueByNamePath } from '../../../utils'
import ProTable from '../../Table'
import { setActionRef } from '../../useFetchData'

function toArray(value: readonly Record<string, any>[] | undefined): Record<string, any>[] {
  return Array.isArray(value) ? [...value] : []
}

function getRowKeyFn(rowKey: any) {
  if (typeof rowKey === 'function')
    return rowKey
  const key = rowKey ?? 'id'
  return (record: Record<string, any>, index?: number) => record?.[key] ?? index
}

function omitCreatorButtonProps(config: Record<string, any> | undefined) {
  if (!config)
    return {}
  const {
    record,
    position,
    creatorButtonText,
    newRecordType,
    parentKey,
    onClick,
    ...buttonProps
  } = config
  return buttonProps
}

function mergeTopCreatorComponents(components: any, creatorButtonDom: any, columnsLength: number | undefined) {
  if (!creatorButtonDom)
    return components

  const originHeader = components?.header || {}
  const OriginWrapper = originHeader.wrapper

  return {
    ...(components || {}),
    header: {
      ...originHeader,
      wrapper: (headerProps: any) => {
        const headerDom = OriginWrapper
          ? <OriginWrapper {...headerProps} />
          : <thead {...headerProps}>{headerProps.children}</thead>
        return (
          <>
            {headerDom}
            <thead style={{ display: 'contents' }}>
              <tr>
                <td colspan={columnsLength || 1} style={{ padding: 0, border: 'none' }}>
                  {creatorButtonDom}
                </td>
              </tr>
            </thead>
          </>
        )
      },
    },
  }
}

const EditableProTableImpl = defineComponent({
  name: 'EditableProTable',
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
    const fieldContext = useFieldContext()
    const actionRef = ref<any>()
    const innerValue = ref<Record<string, any>[]>(toArray(props.value ?? props.defaultValue))
    const previousNameValue = ref<Record<string, any>[] | undefined>()
    const getRowKey = computed(() => getRowKeyFn(props.rowKey))
    const formValue = computed(() => props.name === undefined
      ? undefined
      : getValueByNamePath(fieldContext.rootModel || fieldContext.model || {}, props.name as any))
    const mergedValue = computed(() => {
      if (props.value !== undefined)
        return toArray(props.value)
      if (Array.isArray(formValue.value))
        return [...formValue.value] as Record<string, any>[]
      return innerValue.value
    })

    function syncNameValue(next: Record<string, any>[]) {
      if (props.name !== undefined && fieldContext.model) {
        const model = fieldContext.rootModel || fieldContext.model
        setValueByNamePath(model, props.name as any, next)
        fieldContext.onValuesChange?.(
          setValueByNamePath({}, props.name as any, next),
          model,
        )
      }
    }

    function setValue(next: Record<string, any>[], triggerChange = true) {
      if (props.name !== undefined)
        syncNameValue(next)
      if (props.value === undefined && props.name === undefined)
        innerValue.value = next
      if (triggerChange)
        props.onChange?.(next)
    }

    watchEffect(() => {
      if (props.value !== undefined) {
        innerValue.value = toArray(props.value)
        if (props.controlled && props.name !== undefined)
          syncNameValue(innerValue.value)
      }
    })

    watch(
      () => formValue.value,
      (list) => {
        if (props.name === undefined || !Array.isArray(list))
          return
        if (!previousNameValue.value) {
          previousNameValue.value = toArray(list)
          return
        }
        const changeIndex = list.findIndex((item, index) =>
          JSON.stringify(item) !== JSON.stringify(previousNameValue.value?.[index]))
        if (changeIndex > -1)
          props.editable?.onValuesChange?.(list[changeIndex], list)
        previousNameValue.value = toArray(list)
      },
      { deep: true, immediate: true },
    )

    function resolveRowIndex(rowIndex: string | number) {
      if (rowIndex === undefined || rowIndex === null)
        throw new Error('rowIndex is required')
      const list = mergedValue.value
      if (props.name !== undefined && typeof rowIndex !== 'number') {
        const found = list.findIndex((item, index) =>
          String(getRowKey.value(item, index)) === String(rowIndex))
        return found > -1 ? found : Number(rowIndex)
      }
      if (typeof rowIndex === 'number' && rowIndex >= 0 && rowIndex < list.length)
        return rowIndex
      const found = list.findIndex((item, index) =>
        String(getRowKey.value(item, index)) === String(rowIndex))
      return found > -1 ? found : Number(rowIndex)
    }

    function buildFormApi() {
      const model = fieldContext.rootModel || fieldContext.model || {}
      return {
        getFieldValue: (name: any) => getValueByNamePath(model, name),
        getFieldsValue: () => model,
        setFieldsValue: (values: any) => {
          if (fieldContext.model && values && typeof values === 'object')
            Object.assign(model, values)
        },
      }
    }

    function getRowsData() {
      return toArray(mergedValue.value)
    }

    function getRowData(rowIndex: string | number) {
      const index = resolveRowIndex(rowIndex)
      return Number.isNaN(index) ? undefined : mergedValue.value[index]
    }

    function setRowData(rowIndex: string | number, data: any) {
      const index = resolveRowIndex(rowIndex)
      if (Number.isNaN(index) || index < 0)
        return
      const next = toArray(mergedValue.value)
      next[index] = { ...next[index], ...(data || {}) }
      setValue(next)
      return true
    }

    watchEffect(() => {
      const editableForm: EditableFormInstance<Record<string, any>> = {
        ...buildFormApi(),
        getRowData,
        getRowsData,
        setRowData,
      } as any
      setActionRef(props.editableFormRef, editableForm)
      setActionRef(props.actionRef, actionRef.value)
    })

    const creatorButton = () => {
      const config = props.recordCreatorProps
      if (config === false)
        return null
      if (props.maxLength !== undefined && mergedValue.value.length >= props.maxLength)
        return null
      const record = runFunction(config?.record || {}, mergedValue.value.length, mergedValue.value)
      return (
        <Button
          type="dashed"
          block
          style={{ margin: '10px 0' }}
          icon={<PlusOutlined />}
          {...omitCreatorButtonProps(config as any) as any}
          onClick={async (event: MouseEvent) => {
            const ok = await (config as any)?.onClick?.(event)
            if (ok === false)
              return
            actionRef.value?.addEditRecord?.(cloneDeep(record), {
              position: config?.position,
              newRecordType: config?.newRecordType,
              parentKey: runFunction(config?.parentKey as any, mergedValue.value.length, mergedValue.value),
            })
          }}
        >
          {config?.creatorButtonText || '添加一行数据'}
        </Button>
      )
    }

    return () => {
      const showCreatorButton = Boolean((props.recordCreatorProps as any) && (props.recordCreatorProps as any) !== false)
      const isTopCreator = showCreatorButton && (props.recordCreatorProps as any).position === 'top'
      const topCreatorButton = isTopCreator ? creatorButton() : null
      const mergedComponents = isTopCreator
        ? mergeTopCreatorComponents((attrs as any).components, topCreatorButton, props.columns?.length)
        : (attrs as any).components

      return (
        <>
          <ProTable
            {...attrs as any}
            {...props as any}
            components={mergedComponents}
            columns={props.columns}
            search={false}
            options={false}
            pagination={false}
            rowKey={props.rowKey}
            actionRef={actionRef}
            onChange={props.onTableChange}
            dataSource={mergedValue.value}
            onDataSourceChange={(data: Record<string, any>[]) => setValue(toArray(data))}
            editable={{
              ...(props.editable || {}),
              onValuesChange: (record: any, data: any[]) => {
                props.editable?.onValuesChange?.(record, data)
                props.onValuesChange?.(data, record)
                if (props.controlled)
                  props.onChange?.(data)
              },
            }}
          />
          {showCreatorButton && !isTopCreator ? creatorButton() : null}
        </>
      )
    }
  },
})

const EditableProTable = EditableProTableImpl as typeof EditableProTableImpl & {
  RecordCreator?: any
  new(): { $props: EditableProTableProps<any, any, any> }
}

;(EditableProTable as any).RecordCreator = defineComponent({ render: () => null })

export default EditableProTable
export type { EditableFormInstance, EditableProTableProps }
