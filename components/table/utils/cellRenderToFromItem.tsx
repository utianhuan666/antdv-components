import type { ProFieldEmptyText } from '../../field'
import type { ProFormFieldProps } from '../../form'
import type { ProFieldValueType, ProSchemaComponentTypes, UseEditableUtilType } from '../../utils'
import type { TableContainer } from '../Store/Provide'
import type { ProColumnType } from '../typing'
import { cloneVNode, defineComponent, isVNode } from 'vue'
import { ProField } from '../../field'
import { ProFormField } from '../../form'
import {
  getFieldPropsOrFormItemProps,
  getValueByNamePath,
  InlineErrorFormItem,
  runFunction,
  setValueByNamePath,
} from '../../utils'

const SHOW_EMPTY_TEXT_LIST = ['', null, undefined]

export function buildNamePath(...rest: any[]): (string | number)[] {
  return rest
    .filter(index => index !== undefined)
    .map(item => typeof item === 'number' ? item.toString() : item)
    .flat(1)
}

export const spellNamePath = (...rest: any[]) => buildNamePath(...rest)

export interface CellRenderFromItemProps<T extends Record<string, any>> {
  text: any
  valueType: ProColumnType<T>['valueType']
  index: number
  rowData?: T
  columnEmptyText?: ProFieldEmptyText
  columnProps?: ProColumnType<T> & { entity?: T }
  type?: ProSchemaComponentTypes
  recordKey?: string | number
  mode: 'edit' | 'read'
  prefixName?: string
  counter: TableContainer
  subName?: string[]
  editableUtils?: UseEditableUtilType
}

function resolveColumnName<T extends Record<string, any>>(
  props: CellRenderFromItemProps<T>,
) {
  const { columnProps, prefixName, recordKey, index, subName = [], editableUtils, rowData } = props
  const realIndex = (editableUtils as any)?.getRealIndex?.(rowData!) ?? index
  const rowKey = prefixName ? realIndex : (recordKey ?? index)
  return buildNamePath(
    prefixName,
    prefixName ? subName : [],
    rowKey,
    columnProps?.key ?? columnProps?.dataIndex ?? index,
  )
}

const CellRenderFromItem = defineComponent({
  name: 'ProTableCellRenderFromItem',
  inheritAttrs: false,
  props: ['config', 'proFieldProps'],
  setup(rawProps) {
    const props = rawProps as unknown as {
      config: CellRenderFromItemProps<Record<string, any>>
      proFieldProps: ProFormFieldProps
    }

    return () => {
      const config = props.config
      const columnProps = config.columnProps
      const formItemName = resolveColumnName(config)
      if (formItemName.length === 0)
        return null

      const rowName = formItemName.slice(0, -1)
      const editableForm = config.editableUtils?.editableForm || {}
      const needProps = [
        editableForm,
        {
          ...columnProps,
          rowKey: rowName,
          rowIndex: config.index,
          isEditable: true,
        },
      ] as const

      const formItemProps = {
        ...getFieldPropsOrFormItemProps(columnProps?.formItemProps, ...needProps),
      }
      formItemProps.messageVariables = {
        label: (columnProps?.title as string) || '此项',
        type: (columnProps?.valueType as string) || '文本',
        ...(formItemProps as any).messageVariables,
      }
      ;(formItemProps as any).initialValue = config.prefixName
        ? ((formItemProps as any).initialValue ?? columnProps?.initialValue)
        : (config.text ?? (formItemProps as any).initialValue ?? columnProps?.initialValue)

      const fieldProps = (getFieldPropsOrFormItemProps(columnProps?.fieldProps, ...needProps) || {}) as Record<string, any>
      const originOnChange = fieldProps?.onChange
      const triggerFieldChange = (...args: any[]) => {
        const next = args[0]?.target ? (args[0].target.value ?? args[0].target.checked) : args[0]
        const dataIndex = columnProps?.dataIndex ?? columnProps?.key
        if (config.rowData && dataIndex !== undefined)
          setValueByNamePath(config.rowData, dataIndex as any, next)
        originOnChange?.(...args)
        if (dataIndex !== undefined && config.recordKey !== undefined) {
          ;(config.editableUtils as any)?.updateEditableRow?.(config.recordKey, dataIndex, next)
        }
        else {
          config.editableUtils?.props?.onValuesChange?.(config.rowData, config.editableUtils?.props?.dataSource)
        }
      }
      fieldProps.onChange = triggerFieldChange
      fieldProps.onInput = triggerFieldChange
      fieldProps['onUpdate:value'] = (value: any) => {
        fieldProps.onChange(value)
      }

      let fieldDom = (
        <ProFormField
          key={formItemName.join('-')}
          name={formItemName}
          proFormFieldKey={config.recordKey ?? config.index}
          ignoreFormItem
          fieldProps={fieldProps}
          {...props.proFieldProps as any}
        />
      )

      if (columnProps?.formItemRender) {
        fieldDom = columnProps.formItemRender(
          {
            ...columnProps,
            index: config.index,
            isEditable: true,
            type: 'table',
          },
          {
            defaultRender: () => fieldDom,
            type: 'form',
            recordKey: config.recordKey,
            record: {
              ...config.rowData,
              ...(config.recordKey !== undefined
                ? getValueByNamePath(config.rowData || {}, [config.recordKey])
                : {}),
            },
            isEditable: true,
          },
          editableForm as any,
          config.editableUtils as any,
        ) as any
        if (isVNode(fieldDom)) {
          const originProps = (fieldDom.props || {}) as Record<string, any>
          const fieldValue = getValueByNamePath(config.rowData || {}, columnProps?.dataIndex as any)
          fieldDom = cloneVNode(fieldDom, {
            'name': originProps.name ?? formItemName,
            'ignoreFormItem': originProps.ignoreFormItem,
            'value': fieldValue,
            'onChange': triggerFieldChange,
            'onInput': triggerFieldChange,
            'onUpdate:value': (value: any) => triggerFieldChange(value),
            'fieldProps': {
              ...(originProps.fieldProps || {}),
              'value': fieldValue,
              'onChange': triggerFieldChange,
              'onInput': triggerFieldChange,
              'onUpdate:value': (value: any) => triggerFieldChange(value),
            },
          })
        }
        if ((columnProps as any).ignoreFormItem)
          return fieldDom
      }

      return (
        <InlineErrorFormItem
          key={formItemName.join('-')}
          errorType="popover"
          name={formItemName}
          {...formItemProps as any}
        >
          {fieldDom}
        </InlineErrorFormItem>
      )
    }
  },
})

function cellRenderToFromItem<T extends Record<string, any>>(
  config: CellRenderFromItemProps<T>,
) {
  const { text, valueType, rowData, columnProps, index } = config

  if (
    (!valueType || ['textarea', 'text'].includes(valueType.toString()))
    && !columnProps?.valueEnum
    && config.mode === 'read'
  ) {
    return SHOW_EMPTY_TEXT_LIST.includes(text) ? config.columnEmptyText : text
  }

  if (typeof valueType === 'function' && rowData) {
    return cellRenderToFromItem({
      ...config,
      valueType: valueType(rowData, config.type) || 'text',
    } as any)
  }

  const columnKey = columnProps?.key || columnProps?.dataIndex?.toString()
  const dependencies = columnProps?.dependencies
    ? ([
        config.prefixName,
        config.prefixName ? index?.toString() : config.recordKey?.toString(),
        columnProps?.dependencies,
      ].filter(Boolean).flat(1) as string[])
    : []

  const proFieldProps: ProFormFieldProps = {
    valueEnum: runFunction(columnProps?.valueEnum, rowData),
    request: columnProps?.request as any,
    dependencies: columnProps?.dependencies ? [dependencies] : undefined,
    originDependencies: columnProps?.dependencies ? [columnProps.dependencies] : undefined,
    params: runFunction(columnProps?.params, rowData, columnProps),
    readonly: columnProps?.readonly,
    text: valueType === 'index' || valueType === 'indexBorder'
      ? config.index
      : text,
    value: valueType === 'index' || valueType === 'indexBorder'
      ? config.index
      : text,
    mode: config.mode,
    formItemRender: undefined,
    valueType: valueType as ProFieldValueType,
    record: rowData,
    proFieldProps: {
      emptyText: config.columnEmptyText,
      proFieldKey: columnKey ? `table-field-${columnKey}` : undefined,
    },
  } as any

  if (config.mode !== 'edit') {
    return (
      <ProField
        mode="read"
        text={(proFieldProps as any).text}
        value={(proFieldProps as any).value}
        valueEnum={(proFieldProps as any).valueEnum}
        valueType={(proFieldProps as any).valueType}
        emptyText={config.columnEmptyText}
        request={(proFieldProps as any).request}
        fieldProps={getFieldPropsOrFormItemProps(
          columnProps?.fieldProps,
          null,
          columnProps,
        )}
        {...(proFieldProps as any).proFieldProps}
      />
    )
  }

  return (
    <CellRenderFromItem
      key={config.recordKey ?? config.index}
      config={config as any}
      proFieldProps={proFieldProps}
    />
  )
}

export default cellRenderToFromItem
