import type { PropType, VNodeChild } from 'vue'
import type { BaseFormProps, NamePath, ProFormLayoutType } from '../../typing'
import { Button, Divider, Drawer, Modal, Steps } from 'antdv-next'
import { computed, defineComponent, Fragment, ref, shallowRef } from 'vue'
import ProForm from '../../layouts/ProForm'
import ProFormDatePicker, { ProFormDateTimePicker } from '../DatePicker'
import ProFormDateRangePicker from '../DateRangePicker'
import ProFormDependency from '../Dependency'
import ProFormDigit from '../Digit'
import ProFormFieldSet from '../FieldSet'
import ProFormGroup from '../FormItem/Group'
import ProFormList from '../List'
import ProFormMoney from '../Money'
import ProFormSelect from '../Select'
import ProFormSwitch from '../Switch'
import ProFormText from '../Text'
import ProFormTextArea from '../TextArea'

export type SchemaValueType
  = | 'text'
    | 'textarea'
    | 'password'
    | 'digit'
    | 'money'
    | 'select'
    | 'date'
    | 'dateRange'
    | 'dateTime'
    | 'switch'
    | 'group'
    | 'dependency'
    | 'formList'
    | 'formSet'
    | 'divider'

export interface ProFormColumnsType<T = Record<string, any>> {
  key?: string | number
  title?: VNodeChild | ((props?: any, type?: string, dom?: VNodeChild) => VNodeChild)
  dataIndex?: NamePath
  name?: NamePath[]
  valueType?: SchemaValueType | (string & {})
  tooltip?: VNodeChild
  width?: number | string
  colSize?: number
  readonly?: boolean
  initialValue?: any
  valueEnum?: Record<string, any> | Map<any, any> | ((entity?: T) => Record<string, any> | Map<any, any>)
  fieldProps?: Record<string, any> | ((form: any, config: Record<string, any>) => Record<string, any>)
  formItemProps?: Record<string, any> | ((form: any, config: Record<string, any>) => Record<string, any>)
  proFieldProps?: Record<string, any>
  renderText?: (text: any, record: T, index: number, action: any) => any
  render?: (dom: VNodeChild, entity: T, index: number, action: any, schema: ProFormColumnsType<T>) => VNodeChild
  formItemRender?: (schema: ProFormColumnsType<T>, config: Record<string, any>, form: any) => VNodeChild
  request?: (params?: Record<string, any>, props?: Record<string, any>) => Promise<{ label: VNodeChild, value: any }[]>
  params?: Record<string, any>
  dependencies?: NamePath[] | NamePath
  hideInDescriptions?: boolean
  hideInForm?: boolean
  hideInTable?: boolean
  hideInSearch?: boolean
  columns?: ProFormColumnsType<T>[] | ((values: Record<string, any>) => ProFormColumnsType<T>[])
  colProps?: Record<string, any>
  rowProps?: Record<string, any>
  convertValue?: (value: any, namePath: NamePath) => any
  transform?: (value: any, namePath: NamePath, allValues: Record<string, any>) => any
  order?: number
  debounceTime?: number
  defaultKeyWords?: string
  ignoreFormItem?: boolean
}

export interface BetaSchemaFormProps<T = Record<string, any>, U = Record<string, any>> extends BaseFormProps<T, U> {
  layoutType?: ProFormLayoutType | 'StepForm' | 'Embed'
  steps?: Record<string, any>[]
  columns?: ProFormColumnsType<T>[] | ProFormColumnsType<T>[][]
  shouldUpdate?: boolean | ((newValues: Record<string, any>, oldValues?: Record<string, any>) => boolean)
  title?: VNodeChild
  action?: { value?: any }
  formRef?: { value?: any }
  open?: boolean
  trigger?: VNodeChild
  modalProps?: Record<string, any>
  drawerProps?: Record<string, any>
  onCurrentChange?: (current: number) => void
}

function getTitle(column: ProFormColumnsType) {
  if (typeof column.title === 'function')
    return column.title()
  return column.title
}

function normalizeValueEnum(valueEnum: ProFormColumnsType['valueEnum']) {
  const enumValue = typeof valueEnum === 'function' ? valueEnum() : valueEnum
  if (!enumValue)
    return undefined
  if (enumValue instanceof Map) {
    return Array.from(enumValue.entries()).map(([value, item]) => ({
      value,
      label: typeof item === 'object' ? item.text ?? item.label : item,
      disabled: typeof item === 'object' ? item.disabled : undefined,
    }))
  }
  return Object.entries(enumValue).map(([value, item]) => ({
    value,
    label: typeof item === 'object' ? (item as any).text ?? (item as any).label : item,
    disabled: typeof item === 'object' ? (item as any).disabled : undefined,
  }))
}

function resolveConfig(config: any, form: any, column: ProFormColumnsType) {
  return typeof config === 'function' ? config(form, column) : config
}

function normalizeDependencyNames(name?: NamePath[] | NamePath): NamePath[] {
  if (!name)
    return []
  if (Array.isArray(name) && Array.isArray(name[0]))
    return name as NamePath[]
  return [name as NamePath]
}

const BetaSchemaForm = defineComponent({
  name: 'BetaSchemaForm',
  inheritAttrs: false,
  props: {
    layoutType: { type: String as PropType<BetaSchemaFormProps['layoutType']>, default: 'Form' },
    steps: { type: Array as PropType<Record<string, any>[]>, default: undefined },
    columns: { type: Array as PropType<BetaSchemaFormProps['columns']>, default: () => [] },
    shouldUpdate: { type: [Boolean, Function] as PropType<BetaSchemaFormProps['shouldUpdate']>, default: true },
    title: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    action: { type: Object as PropType<BetaSchemaFormProps['action']>, default: undefined },
    formRef: { type: Object as PropType<BetaSchemaFormProps['formRef']>, default: undefined },
    open: { type: Boolean, default: undefined },
    trigger: { type: [String, Number, Object, Function] as PropType<VNodeChild>, default: undefined },
    modalProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    drawerProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    onCurrentChange: { type: Function as PropType<BetaSchemaFormProps['onCurrentChange']>, default: undefined },
  },
  emits: ['finish', 'currentChange'],
  setup(props, { attrs, emit }) {
    const formRef = shallowRef<any>()
    const innerOpen = ref(false)
    const current = ref(0)

    const flatColumns = computed(() => {
      if (props.layoutType === 'StepsForm' || props.layoutType === 'StepForm')
        return (props.columns as ProFormColumnsType[][])?.[current.value] || []
      return props.columns as ProFormColumnsType[]
    })

    function setCurrent(value: number) {
      current.value = value
      props.onCurrentChange?.(value)
      emit('currentChange', value)
    }

    function renderColumns(columns: ProFormColumnsType[] = [], form = formRef.value): VNodeChild[] {
      return columns
        .filter(column => !column.hideInForm)
        .sort((prev, next) => (next.order ?? 0) - (prev.order ?? 0))
        .map((column, index) => renderColumn(column, index, form))
    }

    function renderField(column: ProFormColumnsType, index: number, form: any): VNodeChild {
      const valueType = column.valueType || 'text'
      const formItemProps = resolveConfig(column.formItemProps, form, column) || {}
      const fieldProps = resolveConfig(column.fieldProps, form, column) || {}
      const commonProps = {
        key: column.key ?? String(column.dataIndex ?? index),
        name: column.dataIndex,
        label: getTitle(column),
        tooltip: column.tooltip,
        width: column.width,
        initialValue: column.initialValue,
        convertValue: column.convertValue,
        transform: column.transform as any,
        readonly: column.readonly,
        fieldProps,
        proFieldProps: column.proFieldProps,
        rules: formItemProps.rules,
        formItemProps: { ...formItemProps, colProps: column.colProps },
      }

      if (column.formItemRender)
        return column.formItemRender(column, { ...commonProps, fieldProps, formItemProps }, form)

      if (valueType === 'divider')
        return <Divider key={commonProps.key} />

      if (valueType === 'group') {
        return (
          <ProFormGroup key={commonProps.key} title={getTitle(column)} rowProps={column.rowProps} colProps={column.colProps}>
            {renderColumns(column.columns as ProFormColumnsType[], form)}
          </ProFormGroup>
        )
      }

      if (valueType === 'dependency') {
        const names = normalizeDependencyNames(column.name || column.dependencies)
        return (
          <ProFormDependency key={commonProps.key} name={names}>
            {(values: Record<string, any>) => renderColumns(typeof column.columns === 'function' ? column.columns(values) : column.columns, form)}
          </ProFormDependency>
        )
      }

      if (valueType === 'formList') {
        return (
          <ProFormList
            {...commonProps}
            name={column.dataIndex as NamePath}
            rules={formItemProps.rules}
            initialValue={column.initialValue}
          >
            {() => renderColumns(column.columns as ProFormColumnsType[], form)}
          </ProFormList>
        )
      }

      if (valueType === 'formSet') {
        return (
          <ProFormFieldSet {...commonProps as any} name={column.dataIndex as NamePath}>
            {renderColumns(column.columns as ProFormColumnsType[], form)}
          </ProFormFieldSet>
        )
      }

      const componentMap: Record<string, any> = {
        text: ProFormText,
        textarea: ProFormTextArea,
        password: (ProFormText as any).Password,
        digit: ProFormDigit,
        money: ProFormMoney,
        select: ProFormSelect,
        date: ProFormDatePicker,
        dateRange: ProFormDateRangePicker,
        dateTime: ProFormDateTimePicker,
        switch: ProFormSwitch,
      }
      const Component = componentMap[valueType] || ProFormText
      const options = normalizeValueEnum(column.valueEnum)
      return <Component {...commonProps} {...fieldProps} options={options} request={column.request} params={column.params} />
    }

    function renderColumn(column: ProFormColumnsType, index: number, form: any): VNodeChild {
      if (!normalizeDependencyNames(column.dependencies).length)
        return renderField(column, index, form)
      return (
        <ProFormDependency key={column.key ?? String(column.dataIndex ?? index)} name={normalizeDependencyNames(column.dependencies)}>
          {() => renderField(column, index, form)}
        </ProFormDependency>
      )
    }

    async function handleFinish(values: Record<string, any>) {
      const result = await (attrs.onFinish as any)?.(values)
      emit('finish', values)
      if (result !== false)
        innerOpen.value = false
      return result
    }

    function renderForm(embed = false) {
      const content = renderColumns(flatColumns.value, formRef.value)
      if (embed)
        return <Fragment>{content}</Fragment>
      return (
        <ProForm
          ref={(instance: any) => {
            formRef.value = instance
            if (props.formRef)
              props.formRef.value = instance
          }}
          {...{ ...attrs, onFinish: handleFinish } as any}
        >
          {content}
        </ProForm>
      )
    }

    function renderStepsForm() {
      const steps = props.steps || []
      return (
        <ProForm ref={formRef} {...{ ...attrs, onFinish: handleFinish } as any}>
          <Steps current={current.value} items={steps.map(item => ({ title: item.title }))} style={{ marginBottom: 24 }} />
          {renderColumns(flatColumns.value, formRef.value)}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {current.value > 0 ? <Button onClick={() => setCurrent(current.value - 1)}>上一步</Button> : null}
            {current.value < ((props.columns as ProFormColumnsType[][])?.length || 1) - 1
              ? <Button type="primary" onClick={() => setCurrent(current.value + 1)}>下一步</Button>
              : <Button type="primary" htmlType="submit">提交</Button>}
          </div>
        </ProForm>
      )
    }

    return () => {
      if (props.layoutType === 'Embed')
        return renderForm(true)
      if (props.layoutType === 'StepsForm' || props.layoutType === 'StepForm')
        return renderStepsForm()

      const open = props.open ?? innerOpen.value
      const trigger = props.trigger ? <span onClick={() => (innerOpen.value = true)}>{props.trigger}</span> : null

      if (props.layoutType === 'ModalForm') {
        return (
          <>
            {trigger}
            <Modal title={props.title as any} open={open} onCancel={() => (innerOpen.value = false)} footer={null} {...props.modalProps}>
              {renderForm()}
            </Modal>
          </>
        )
      }

      if (props.layoutType === 'DrawerForm') {
        return (
          <>
            {trigger}
            <Drawer title={props.title as any} open={open} onClose={() => (innerOpen.value = false)} {...props.drawerProps}>
              {renderForm()}
            </Drawer>
          </>
        )
      }

      return renderForm()
    }
  },
})

export default BetaSchemaForm
