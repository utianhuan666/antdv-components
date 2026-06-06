import type { DescriptionsItemProps as AntdDescriptionsCellProps, DescriptionsProps, FormProps } from 'antdv-next'
import type { Ref, VNodeChild } from 'vue'
import type { ProFieldValueTypeInput } from '../field'
import type { ProCoreActionType, ProSchema, ProSchemaComponentTypes } from '../utils'
import type { RecordKey, UseEditableMapType, UseEditableMapUtilType } from '../utils/useEditableMap'
import type { ProDescriptionsRequestResult } from './useFetchData'

export type DescriptionsItemProps = AntdDescriptionsCellProps

export type RowEditableConfig<RecordType extends Record<string, any> = any> = Partial<UseEditableMapType<RecordType>> & {
  form?: any
  editableKeys?: RecordKey[]
  actionRender?: UseEditableMapType<RecordType>['actionRender']
}

type ProDescriptionsCellLayout = Omit<AntdDescriptionsCellProps, 'children' | 'label'> & {
  label?: VNodeChild
  children?: VNodeChild
  content?: VNodeChild
}

export type ProDescriptionsColumn<
  TRecord = Record<string, unknown>,
  TValueType = 'text',
> = ProSchema<
  TRecord,
  ProDescriptionsCellLayout & {
    hide?: boolean
    plain?: boolean
    copyable?: boolean
    ellipsis?: any
    mode?: 'read' | 'edit' | 'update' | (string & {})
    order?: number
    index?: number
  },
  ProSchemaComponentTypes,
  TValueType
>

export type ProDescriptionsItemProps<
  T = Record<string, unknown>,
  ValueType = 'text',
> = ProDescriptionsColumn<T, ValueType>

export type ProDescriptionsActionType<
  TRecord extends Record<string, any> = Record<string, any>,
> = ProCoreActionType<{}, Partial<UseEditableMapUtilType>> & {
  dataSource: TRecord | undefined
  setDataSource: (value: TRecord | undefined) => void
}

export type ProDescriptionsProps<
  TRecord extends Record<string, any> = Record<string, any>,
  TValueType = 'text',
> = Omit<DescriptionsProps, 'children' | 'items'> & {
  params?: Record<string, unknown>
  onRequestError?: (e: Error) => void
  request?: (
    params: Record<string, unknown> | undefined,
  ) => Promise<ProDescriptionsRequestResult<TRecord>>
  columns?: ProDescriptionsColumn<TRecord, TValueType>[]
  actionRef?: Ref<ProDescriptionsActionType<any> | ProCoreActionType<any> | undefined> | { current?: ProDescriptionsActionType<any> | ProCoreActionType<any> }
  loading?: boolean
  onLoadingChange?: (loading?: boolean) => void
  tooltip?: any
  formProps?: FormProps & Record<string, any>
  editable?: RowEditableConfig<TRecord>
  dataSource?: TRecord
  onDataSourceChange?: (value: TRecord | undefined) => void
  emptyText?: VNodeChild
}

export type { ProFieldValueTypeInput }
