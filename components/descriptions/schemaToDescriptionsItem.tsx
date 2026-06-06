import type { DescriptionsItemType } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProCoreActionType, UseEditableMapUtilType } from '../utils'
import type { ProDescriptionsColumn } from './typing'
import { EditOutlined } from '@antdv-next/icons'
import { Fragment } from 'vue'
import { LabelIconTip } from '../utils'
import { FieldRender } from './FieldRender'
import { getDataFromConfig } from './getDataFromConfig'
import { resolveDescriptionsValueType } from './resolveValueType'

export function schemaToDescriptionsItem(
  items: ProDescriptionsColumn<any, any>[],
  entity: Record<string, unknown> | undefined,
  action: ProCoreActionType<any>,
  editableUtils?: UseEditableMapUtilType,
  emptyText?: VNodeChild,
  form?: any,
) {
  const options: VNodeChild[] = []
  const children = items
    ?.map?.((item, index) => {
      const row = entity ?? {}
      const {
        valueEnum: _valueEnum,
        render: _render,
        renderText,
        mode,
        plain: _plain,
        dataIndex,
        request: _request,
        params: _params,
        editable,
        ...restItem
      } = item as ProDescriptionsColumn

      const defaultData = getDataFromConfig(item, entity) ?? restItem.children
      const text = renderText
        ? renderText(defaultData, row, index, action)
        : defaultData

      const title = typeof restItem.title === 'function'
        ? restItem.title(item as any, 'descriptions', null)
        : restItem.title

      const valueType = resolveDescriptionsValueType(item, row)
      const recordKey = (dataIndex as any) ?? index
      const isEditable = editableUtils?.isEditable(recordKey)
      const fieldMode = mode != null ? mode : isEditable ? 'edit' : 'read'
      const canEdit = editable !== false && (typeof editable !== 'function' || editable(text, row, index) !== false)
      const showEditIcon = Boolean(editableUtils && fieldMode === 'read' && canEdit)
      const key = restItem.key || restItem.label?.toString() || index
      const label = (title || restItem.label || restItem.tooltip)
        ? (
            <LabelIconTip
              label={(title || restItem.label) as any}
              tooltip={restItem.tooltip}
              ellipsis={item.ellipsis}
            />
          )
        : undefined

      const fieldNode = (
        <FieldRender
          {...item as any}
          key={item?.key as any}
          dataIndex={(item.dataIndex as any) ?? index}
          mode={fieldMode as any}
          text={text}
          valueType={valueType as any}
          entity={row}
          index={index}
          emptyText={emptyText}
          action={action}
          editableUtils={editableUtils}
          form={form}
        />
      )

      const childrenNode = showEditIcon
        ? (
            <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', maxWidth: '100%' }}>
              {fieldNode}
              <EditOutlined
                onClick={() => {
                  editableUtils?.startEditable(recordKey)
                }}
              />
            </span>
          )
        : fieldNode

      const field: DescriptionsItemType | VNodeChild = valueType !== 'option'
        ? ({
            ...restItem,
            key,
            label,
            content: childrenNode,
          } as DescriptionsItemType)
        : (
            <Fragment key={key}>
              {childrenNode}
            </Fragment>
          )

      if (valueType === 'option') {
        options.push(field as VNodeChild)
        return null
      }
      return field
    })
    .filter(Boolean)
  return {
    options: options?.length ? options : null,
    children,
  }
}
