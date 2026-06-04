import type { PropType, VNodeChild } from 'vue'
import type {
  BetaSchemaFormProps,
  ItemType,
  ProFormColumnsType,
  SchemaLayoutType,
} from './typing'
import { Drawer, Modal } from 'antdv-next'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { LightFilter, ProForm, QueryFilter } from '../../layouts'
import { Embed, StepsForm } from './layoutType'
import { renderValueType } from './valueType'

export * from './typing'

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

function stringifyName(name: unknown, fallback: number) {
  if (Array.isArray(name))
    return name.join('_')
  return name ?? fallback
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
  props: {
    layoutType: { type: String as PropType<SchemaLayoutType>, default: 'Form' },
    type: { type: String, default: 'form' },
    steps: { type: Array as PropType<Record<string, any>[]>, default: undefined },
    columns: { type: Array as PropType<BetaSchemaFormProps['columns']>, default: () => [] },
    shouldUpdate: { type: [Boolean, Function] as PropType<BetaSchemaFormProps['shouldUpdate']>, default: true },
    title: { type: [String, Number, Object, Function] as PropType<VNodeChild>, default: undefined },
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
    const renderTick = ref(0)
    const oldValuesRef = shallowRef<Record<string, any>>()

    const flatColumns = computed(() => {
      if (props.layoutType === 'StepsForm')
        return []
      return props.columns as ProFormColumnsType[]
    })

    function getTitle(column: ProFormColumnsType) {
      return runFunction(column.title as any, column, 'form', column.title as any)
    }

    function resolveConfig(config: any, form: any, column: ProFormColumnsType) {
      return typeof config === 'function' ? config(form, column) : config
    }

    function genItems(columns: ProFormColumnsType[] = [], form = formRef.value): VNodeChild[] {
      renderTick.value
      return columns
        .filter(column => !(column.hideInForm && props.type === 'form'))
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
            type: props.type,
            originItem,
            formRef,
            genItems: (items: ProFormColumnsType[]) => genItems(items, form),
          })
        })
        .filter(Boolean) as VNodeChild[]
    }

    function handleValuesChange(changedValues: Record<string, any>, values: Record<string, any>) {
      const shouldRender = props.shouldUpdate === true
        || (typeof props.shouldUpdate === 'function' && props.shouldUpdate(values, oldValuesRef.value))

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

      const FormComponent = (layoutComponents[props.layoutType as keyof typeof layoutComponents] || ProForm) as any
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
      if (props.layoutType === 'Embed')
        return renderForm(true)

      if (props.layoutType === 'StepsForm') {
        return (
          <StepsForm
            {...attrs}
            columns={props.columns as ProFormColumnsType[][]}
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
