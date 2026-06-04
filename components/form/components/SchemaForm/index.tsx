import type { DefineComponent, VNodeChild } from 'vue'
import type {
  BetaSchemaFormProps,
  ItemType,
  ProFormColumnsType,
} from './typing'
import { Drawer, Modal } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { LightFilter, ProForm, QueryFilter } from '../../layouts'
import { Embed, StepsForm } from './layoutType'
import { renderValueType } from './valueType'

export * from './typing'

const betaSchemaFormPropNames = [
  'layoutType',
  'type',
  'steps',
  'columns',
  'shouldUpdate',
  'title',
  'action',
  'formRef',
  'open',
  'trigger',
  'modalProps',
  'drawerProps',
  'onCurrentChange',
] as const

function runFunction<T>(value: T | ((...args: any[]) => T), ...args: any[]): T {
  return typeof value === 'function' ? (value as (...args: any[]) => T)(...args) : value
}

function omitUndefined<T extends Record<string, any>>(value: T): T {
  return Object.keys(value).reduce<Record<string, any>>((result, key) => {
    if (value[key] !== undefined)
      result[key] = value[key]
    return result
  }, {}) as T
}

function normalizeBooleanProp(value: unknown, defaultValue = false) {
  if (value === '')
    return true
  return typeof value === 'boolean' ? value : defaultValue
}

const layoutComponents = {
  Form: ProForm,
  QueryFilter,
  LightFilter,
  Embed,
}

const BetaSchemaForm = defineComponent({
  name: 'BetaSchemaForm',
  inheritAttrs: false,
  props: [...betaSchemaFormPropNames],
  emits: ['finish', 'currentChange'],
  setup(rawProps, { attrs, emit }) {
    const props = rawProps as unknown as BetaSchemaFormProps
    const formRef = shallowRef<any>()
    const innerOpen = ref(false)
    const renderTick = ref(0)
    const oldValuesRef = shallowRef<Record<string, any>>()
    const layoutType = computed(() => props.layoutType ?? 'Form')
    const formType = computed(() => props.type ?? 'form')
    const columns = computed(() => props.columns ?? [])

    const flatColumns = computed(() => {
      if (layoutType.value === 'StepsForm')
        return []
      return columns.value as ProFormColumnsType[]
    })

    function getTitle(column: ProFormColumnsType) {
      return runFunction(column.title as any, column, 'form', column.title as any)
    }

    function resolveConfig(config: any, form: any, column: ProFormColumnsType) {
      return typeof config === 'function' ? config(form, column) : config
    }

    function genItems(columns: ProFormColumnsType[] = [], form = formRef.value): VNodeChild[] {
      void renderTick.value
      return columns
        .filter(column => !(column.hideInForm && formType.value === 'form'))
        .sort((prev, next) => {
          if (prev.order || next.order)
            return (next.order || 0) - (prev.order || 0)
          return ((next as any).index || 0) - ((prev as any).index || 0)
        })
        .map((originItem, index) => {
          const item = omitUndefined({
            ...originItem,
            title: getTitle(originItem),
            label: getTitle(originItem),
            name: originItem.name,
            valueType: runFunction(originItem.valueType as any, {}),
            key: originItem.key || originItem.dataIndex || index,
            dataIndex: originItem.dataIndex || originItem.key,
            index: originItem.index ?? index,
            getFieldProps: originItem.fieldProps
              ? () => resolveConfig(originItem.fieldProps, formRef.value, originItem)
              : undefined,
            getFormItemProps: originItem.formItemProps
              ? () => resolveConfig(originItem.formItemProps, formRef.value, originItem)
              : undefined,
            originProps: originItem,
          }) as ItemType

          return renderValueType(item, {
            action: props.action,
            type: formType.value,
            originItem,
            formRef,
            genItems: (items: ProFormColumnsType[]) => genItems(items, form),
          })
        })
        .filter(Boolean) as VNodeChild[]
    }

    function handleValuesChange(changedValues: Record<string, any>, values: Record<string, any>) {
      const shouldUpdate = (props.shouldUpdate as unknown) === '' ? true : props.shouldUpdate ?? true
      const shouldRender = shouldUpdate === true
        || (typeof shouldUpdate === 'function' && shouldUpdate(values, oldValuesRef.value))

      if (shouldRender)
        renderTick.value += 1
      oldValuesRef.value = values
      ;(attrs.onValuesChange as any)?.(changedValues, values)
    }

    async function handleFinish(values: Record<string, any>) {
      const result = await (attrs.onFinish as any)?.(values)
      emit('finish', values)
      if (result !== false)
        innerOpen.value = false
      return result
    }

    function setFormRef(instance: any) {
      formRef.value = instance
      if (props.formRef)
        props.formRef.value = instance
    }

    function renderForm(embed = false) {
      const content = genItems(flatColumns.value, formRef.value)
      if (embed)
        return <Embed>{content}</Embed>

      const FormComponent = (layoutComponents[layoutType.value as keyof typeof layoutComponents] || ProForm) as any
      return (
        <FormComponent
          ref={setFormRef}
          {...attrs}
          onFinish={handleFinish as any}
          onValuesChange={handleValuesChange as any}
        >
          {content}
        </FormComponent>
      )
    }

    return () => {
      if (layoutType.value === 'Embed')
        return renderForm(true)

      if (layoutType.value === 'StepsForm') {
        return (
          <StepsForm
            {...attrs}
            columns={columns.value as ProFormColumnsType[][]}
            steps={props.steps || []}
            formRef={formRef as any}
            externalFormRef={props.formRef}
            renderColumns={genItems}
            onFinish={handleFinish as any}
            onCurrentChange={(value: number) => {
              props.onCurrentChange?.(value)
              emit('currentChange', value)
            }}
          />
        )
      }

      const open = props.open === undefined ? innerOpen.value : normalizeBooleanProp(props.open)
      const trigger = props.trigger ? <span onClick={() => (innerOpen.value = true)}>{props.trigger}</span> : null

      if (layoutType.value === 'ModalForm') {
        return (
          <>
            {trigger}
            <Modal title={props.title as any} open={open} onCancel={() => (innerOpen.value = false)} footer={null} {...props.modalProps}>
              {renderForm()}
            </Modal>
          </>
        )
      }

      if (layoutType.value === 'DrawerForm') {
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
}) as unknown as DefineComponent<BetaSchemaFormProps>

export default BetaSchemaForm
