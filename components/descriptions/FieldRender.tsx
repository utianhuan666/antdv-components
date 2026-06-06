import type { ProCoreActionType, UseEditableMapUtilType } from '../utils'
import type { ProDescriptionsColumn, ProFieldValueTypeInput } from './typing'
import { CheckOutlined, CloseOutlined } from '@antdv-next/icons'
import { defineComponent } from 'vue'
import { ProField } from '../field'
import { ProFormField } from '../form'
import { genCopyable, getFieldPropsOrFormItemProps, getValueByNamePath, InlineErrorFormItem } from '../utils'

const AnyInlineErrorFormItem = InlineErrorFormItem as any
const AnyProField = ProField as any
const AnyProFormField = ProFormField as any

export const FieldRender = defineComponent({
  name: 'ProDescriptionsFieldRender',
  inheritAttrs: false,
  props: [
    'valueEnum',
    'action',
    'index',
    'text',
    'entity',
    'mode',
    'render',
    'editableUtils',
    'valueType',
    'plain',
    'dataIndex',
    'request',
    'formItemRender',
    'params',
    'emptyText',
    'fieldProps',
    'formItemProps',
    'copyable',
    'ellipsis',
    'title',
    'label',
    'tooltip',
    'editable',
    'form',
  ],
  setup(rawProps) {
    const props = rawProps as Omit<ProDescriptionsColumn<any>, 'valueType'> & {
      text: any
      valueType: ProFieldValueTypeInput
      entity: any
      action: ProCoreActionType<any>
      index: number
      editableUtils?: UseEditableMapUtilType
      emptyText?: any
      form?: any
    }

    function getRecordKey() {
      return (props.dataIndex as any) ?? props.index
    }

    function renderReadField() {
      const rawText = getValueByNamePath(props.entity, props.dataIndex as any)
      const fieldProps = getFieldPropsOrFormItemProps(
        props.fieldProps,
        undefined,
        {
          ...props,
          rowKey: props.dataIndex,
          isEditable: false,
        },
      )
      return (
        <AnyProField
          text={props.text}
          value={props.text}
          valueEnum={props.valueEnum as any}
          mode="read"
          emptyText={props.emptyText}
          render={(finText: any, _fieldProps: any, dom: any) => {
            const rendered = props.render
              ? props.render?.(dom ?? finText, props.entity, props.index, props.action, {
                  ...props,
                  type: 'descriptions',
                })
              : dom
            return genCopyable(rendered as any, props, finText as any, rawText)
          }}
          valueType={props.valueType}
          request={props.request as any}
          params={props.params as any}
          fieldProps={fieldProps}
        />
      )
    }

    function renderEditField() {
      const formItemProps = getFieldPropsOrFormItemProps(
        props.formItemProps,
        undefined,
        {
          ...props,
          rowKey: props.dataIndex,
          isEditable: true,
        },
      )
      const fieldProps = getFieldPropsOrFormItemProps(
        props.fieldProps,
        undefined,
        {
          ...props,
          rowKey: props.dataIndex,
          isEditable: true,
        },
      )
      const recordKey = getRecordKey()
      const defaultRender = () => (
        <AnyProFormField
          name={props.dataIndex as any}
          valueEnum={props.valueEnum as any}
          mode="edit"
          ignoreFormItem
          valueType={props.valueType}
          request={props.request as any}
          params={props.params as any}
          fieldProps={fieldProps}
          proFieldProps={{ emptyText: props.emptyText }}
        />
      )

      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <AnyInlineErrorFormItem
            name={props.dataIndex as any}
            {...formItemProps}
            style={{
              margin: 0,
              ...(formItemProps?.style || {}),
            }}
            initialValue={props.text || formItemProps?.initialValue}
          >
            {props.formItemRender
              ? props.formItemRender(
                  {
                    ...props,
                    type: 'descriptions',
                  },
                  {
                    isEditable: true,
                    recordKey,
                    record: props.form?.getFieldValue
                      ? props.form.getFieldValue([props.dataIndex as any].flat(1))
                      : getValueByNamePath(props.entity, props.dataIndex as any),
                    defaultRender,
                    type: 'descriptions',
                  },
                  props.form,
                )
              : defaultRender()}
          </AnyInlineErrorFormItem>
          <div style={{ display: 'flex', maxHeight: '32px', alignItems: 'center', gap: '8px' }}>
            {props.editableUtils?.actionRender?.(recordKey, {
              cancelText: <CloseOutlined />,
              saveText: <CheckOutlined />,
              deleteText: false,
            } as any)}
          </div>
        </div>
      )
    }

    return () => {
      if (props.mode === 'read' || !props.mode || props.valueType === 'option')
        return renderReadField()

      return (
        <div style={{ marginTop: '-5px', marginBottom: '-5px', marginLeft: 0, marginRight: 0, width: '100%' }}>
          {renderEditField()}
        </div>
      )
    }
  },
})

export default FieldRender
