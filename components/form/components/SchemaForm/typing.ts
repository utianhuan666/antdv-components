import type { NamePath, ProSchema, SearchConvertKeyFn, SearchTransformKeyFn } from '../../../utils'
import type { ProFormInstance } from '../../BaseForm'
import type {
  DrawerFormProps,
  LightFilterProps,
  ModalFormProps,
  ProFormProps,
  QueryFilterProps,
  StepFormProps,
  StepsFormProps,
} from '../../layouts'
import type { ProFormGridConfig } from '../../typing'
import type { ProFormFieldProps } from '../Field'

export type ExtraProColumnType = {
  tooltip?: any
  key?: string | number | symbol
  className?: string
  width?: string | number
  name?: NamePath | NamePath[]
  defaultKeyWords?: string
} & Pick<ProFormGridConfig, 'rowProps' | 'colProps'>

export type ProFormPropsType<T, ValueType = 'text'>
  = | (((
    | ({ layoutType?: 'Form' } & ProFormProps<T>)
    | ({ layoutType: 'DrawerForm' } & DrawerFormProps<T>)
    | ({ layoutType: 'ModalForm' } & ModalFormProps<T>)
    | ({ layoutType: 'QueryFilter' } & QueryFilterProps<T>)
    | ({ layoutType: 'LightFilter' } & LightFilterProps<T>)
    | ({ layoutType: 'StepForm' } & StepFormProps<T>)
    | { layoutType: 'Embed' }
  ) & {
    columns: ProFormColumnsType<T, ValueType>[]
  })
  | ({
    layoutType: 'StepsForm'
    columns: ProFormColumnsType<T, ValueType>[][]
  } & StepsFormProps<T>))

export type ProFormLayoutType = ProFormPropsType<any>['layoutType']

export type FormFieldType
  = | 'group'
    | 'formList'
    | 'formSet'
    | 'divider'
    | 'dependency'

export type ProFormColumnsType<T = any, ValueType = 'text'> = ProSchema<
  T,
  ExtraProColumnType & {
    index?: number
    colSize?: number
    readonly?: boolean
    initialValue?: any
    convertValue?: SearchConvertKeyFn
    transform?: SearchTransformKeyFn
    order?: number
    columns?:
      | ProFormColumnsType<T, ValueType | FormFieldType>[]
      | ((values: any) => ProFormColumnsType<T, ValueType | FormFieldType>[])
  },
  'form',
  ValueType
>

export type FormSchema<T = Record<string, any>, ValueType = 'text'>
  = ProFormPropsType<T, ValueType> & {
    columns: ProFormColumnsType<T, ValueType>[] | ProFormColumnsType<T, ValueType>[][]
    steps?: Array<Record<string, any>>
    type?: 'form'
    action?: any
    shouldUpdate?: boolean | ((values: T, oldValues?: T) => boolean)
  }

export interface ProFormRenderValueTypeHelpers<T, ValueType> {
  action?: any
  type?: 'form'
  originItem: ProFormColumnsType<T, ValueType>
  formRef: { value?: ProFormInstance }
  genItems: (items: ProFormColumnsType<T, ValueType>[]) => any[]
}

export type ItemType<T, ValueType> = ProFormColumnsType<T, ValueType> & {
  label?: any
  getFieldProps?: () => Record<string, any>
  getFormItemProps?: () => Record<string, any>
}

export type ProSchemaRenderValueTypeFunction<T = any, ValueType = any> = (
  item: ItemType<T, ValueType>,
  helpers: ProFormRenderValueTypeHelpers<T, ValueType>,
) => any

export interface ProFormRenderValueTypeItem<T, ValueType> {
  valueType: string
  render: ProSchemaRenderValueTypeFunction<T, ValueType>
}

export type { ProFormFieldProps }
