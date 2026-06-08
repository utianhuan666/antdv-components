import type { PropType } from 'vue'
import type { ProFormInstance } from '../../BaseForm'
import type { FormSchema, ItemType, ProFormColumnsType } from './typing'
import { defineComponent, ref } from 'vue'
import { LabelIconTip, runFunction, stringify } from '../../../utils'
import { DrawerForm, LightFilter, ModalForm, ProForm, QueryFilter, StepForm } from '../../layouts'
import { setRefValue } from '../../layouts/_shared/vueHelpers'
import { Embed, StepsForm } from './layoutType'
import { renderValueType } from './valueType'

const FormLayoutType = {
  DrawerForm,
  QueryFilter,
  LightFilter,
  StepForm,
  StepsForm,
  ModalForm,
  Embed,
  Form: ProForm,
}

export const BetaSchemaForm = defineComponent({
  name: 'BetaSchemaForm',
  inheritAttrs: false,
  props: {
    columns: { type: Array as PropType<ProFormColumnsType[]>, default: () => [] },
    layoutType: { type: String, default: 'Form' },
  },
  setup(props, { attrs, slots }) {
    const formRef = ref<ProFormInstance>()
    const oldValuesRef = ref<any>()
    const updateKey = ref(0)

    const genItems = (items: ProFormColumnsType[]) => {
      const schema = { ...attrs, ...props } as FormSchema
      return (items || [])
        .filter(originItem => !(originItem.hideInForm && (schema.type || 'form') === 'form'))
        .sort((a, b) => {
          if (b.order || a.order)
            return (b.order || 0) - (a.order || 0)
          return ((b as any).index || 0) - ((a as any).index || 0)
        })
        .map((originItem, index) => {
          const title = runFunction(
            originItem.title,
            originItem,
            'form',
            <LabelIconTip label={originItem.title as string} tooltip={originItem.tooltip} />,
          )
          const item = {
            title,
            label: title,
            name: originItem.name,
            valueType: runFunction(originItem.valueType, {}),
            key: originItem.key || originItem.dataIndex || index,
            columns: originItem.columns,
            valueEnum: originItem.valueEnum,
            dataIndex: originItem.dataIndex || originItem.key,
            initialValue: originItem.initialValue,
            width: originItem.width,
            index: (originItem as any).index,
            readonly: originItem.readonly,
            colSize: originItem.colSize,
            colProps: originItem.colProps,
            rowProps: originItem.rowProps,
            className: originItem.className,
            tooltip: originItem.tooltip,
            dependencies: originItem.dependencies,
            proFieldProps: originItem.proFieldProps,
            ignoreFormItem: originItem.ignoreFormItem,
            getFieldProps: originItem.fieldProps
              ? () => runFunction(originItem.fieldProps, formRef.value, originItem)
              : undefined,
            getFormItemProps: originItem.formItemProps
              ? () => runFunction(originItem.formItemProps, formRef.value, originItem)
              : undefined,
            render: originItem.render,
            formItemRender: originItem.formItemRender,
            renderText: originItem.renderText,
            request: originItem.request,
            params: originItem.params,
            transform: originItem.transform,
            convertValue: originItem.convertValue,
            debounceTime: originItem.debounceTime,
            defaultKeyWords: originItem.defaultKeyWords,
          } as ItemType<any, any>

          return renderValueType(item, {
            action: schema.action,
            type: schema.type || 'form',
            originItem,
            formRef,
            genItems,
          })
        })
        .filter(Boolean)
    }

    return () => {
      void updateKey.value
      const schema = { ...attrs, ...props } as FormSchema
      const layoutType = schema.layoutType || 'Form'
      const FormRenderComponents = (FormLayoutType[layoutType as keyof typeof FormLayoutType] || ProForm) as any
      const formChildrenDoms = Array.isArray(schema.columns?.[0])
        ? undefined
        : genItems(schema.columns as ProFormColumnsType[])
      const specificProps = layoutType === 'StepsForm'
        ? {
            forceUpdate: () => {
              updateKey.value += 1
            },
            columns: schema.columns as ProFormColumnsType[][],
          }
        : {}

      // mirror: 这里要包裹 onInit / onValuesChange，需把原始 attrs 中的同名监听摘除，
      // 否则 Vue 会把 spread 的监听器与下面显式的监听器合并为数组（多监听器），
      // 导致下游 props.onInit 变成数组（非函数）而永不触发。
      const { onInit: _attrsOnInit, onValuesChange: _attrsOnValuesChange, ...restAttrs } = attrs as any

      return (
        <FormRenderComponents
          {...specificProps}
          {...restAttrs}
          columns={schema.columns}
          steps={schema.steps}
          onInit={(values: any, initForm: ProFormInstance) => {
            setRefValue((attrs as any).formRef, initForm)
            formRef.value = initForm
            ;(attrs as any).onInit?.(values, initForm)
          }}
          onValuesChange={(changedValues: any, values: any) => {
            const shouldUpdate = schema.shouldUpdate ?? ((pre: any, next: any) => stringify(pre) !== stringify(next))
            if (
              shouldUpdate === true
              || (typeof shouldUpdate === 'function' && shouldUpdate(values, oldValuesRef.value))
            ) {
              updateKey.value += 1
            }
            oldValuesRef.value = values
            ;(attrs as any).onValuesChange?.(changedValues, values)
          }}
        >
          {formChildrenDoms}
          {slots.default?.()}
        </FormRenderComponents>
      )
    }
  },
})

export default BetaSchemaForm

export type { ProFormColumnsType, ProFormLayoutType } from './typing'
