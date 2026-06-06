import type { ProFieldEmptyText } from '../../field'
import type {
  ProFieldValueType,
  ProSchemaComponentTypes,
  ProTableEditableFnType,
  UseEditableUtilType,
} from '../../utils'
import type { TableContainer } from '../Store/Provide'
import type { ActionType, ProColumns } from '../typing'
import { genCopyable, getValueByNamePath, isNil, LabelIconTip } from '../../utils'
import cellRenderToFromItem from './cellRenderToFromItem'

export interface ColumnRenderInterface<T> {
  columnProps: ProColumns<T>
  text: any
  rowData: T
  index: number
  columnEmptyText?: ProFieldEmptyText
  type: ProSchemaComponentTypes
  counter: TableContainer
  editableUtils: UseEditableUtilType
  subName: string[]
  recordKey?: string | number
  marginSM?: number
}

export function renderColumnsTitle(item: ProColumns<any>) {
  const { title } = item
  const ellipsis = typeof item?.ellipsis === 'boolean'
    ? item?.ellipsis
    : item?.ellipsis?.showTitle
  if (title && typeof title === 'function')
    return title(item, 'table', null)
  return <LabelIconTip label={title} tooltip={item.tooltip} ellipsis={ellipsis} />
}

function isNotEditableCell<T>(
  text: any,
  rowData: T,
  index: number,
  editable?: ProTableEditableFnType<T> | boolean,
) {
  if (typeof editable === 'boolean')
    return editable === false
  return editable?.(text, rowData, index) === false
}

export function defaultOnFilter(value: string, record: any, dataIndex: string | string[]) {
  const recordElement = Array.isArray(dataIndex)
    ? getValueByNamePath(record, dataIndex)
    : record[dataIndex]
  return String(recordElement) === String(value)
}

function isMergeCell(dom: any) {
  return dom && typeof dom === 'object' && ('children' in dom || 'props' in dom)
    && ('colSpan' in dom || 'rowSpan' in dom || 'props' in dom)
}

export function columnRender<T extends Record<string, any>>({
  columnProps,
  text,
  rowData,
  index,
  columnEmptyText,
  counter,
  type,
  subName,
  recordKey: rowRecordKey,
  marginSM,
  editableUtils,
}: ColumnRenderInterface<T>) {
  const { action, prefixName } = counter
  const rowEditableInfo = (editableUtils as any)?.isEditable?.(rowRecordKey)
  const editableInfo = rowEditableInfo || (editableUtils as any)?.isEditable?.({
    ...rowData,
    index,
  })
  || { isEditable: false }
  const isEditable = typeof editableInfo === 'boolean'
    ? editableInfo
    : Boolean(editableInfo?.isEditable)
  const recordKey = rowRecordKey ?? (typeof editableInfo === 'object'
    ? editableInfo?.recordKey
    : undefined)
  const { renderText = (val: any) => val } = columnProps

  const renderTextStr = (renderText as any)(text, rowData, index, action as ActionType)
  const mode = isEditable && !isNotEditableCell(text, rowData, index, columnProps?.editable)
    ? 'edit'
    : 'read'
  const valueType = (columnProps.valueType as ProFieldValueType) || 'text'

  const textDom = cellRenderToFromItem<T>({
    text: renderTextStr,
    valueType,
    index,
    rowData,
    subName,
    columnProps: {
      ...columnProps,
      entry: rowData,
      entity: rowData,
    } as any,
    counter,
    columnEmptyText,
    type,
    recordKey,
    mode,
    prefixName,
    editableUtils,
  })

  const dom = mode === 'edit'
    ? textDom
    : genCopyable(textDom, columnProps as any, renderTextStr, text)

  if (mode === 'edit') {
    if (columnProps.valueType === 'option') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: marginSM,
            justifyContent: columnProps.align === 'center' ? 'center' : 'flex-start',
          }}
        >
          {editableUtils?.actionRender?.({
            ...rowData,
            index: columnProps.index || index,
          } as any)}
        </div>
      )
    }
    return dom
  }

  if (!columnProps.render)
    return !isNil(dom) ? dom : null

  const renderDom = columnProps.render(
    dom,
    rowData,
    index,
    {
      ...(action as ActionType),
      ...editableUtils,
    },
    {
      ...columnProps,
      isEditable,
      type: 'table',
    },
  )

  if (isMergeCell(renderDom))
    return renderDom

  if (renderDom && columnProps.valueType === 'option' && Array.isArray(renderDom)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 8,
        }}
      >
        {renderDom}
      </div>
    )
  }

  return renderDom
}
