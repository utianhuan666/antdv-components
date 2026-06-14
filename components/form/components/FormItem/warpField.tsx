import type { Component, ComponentPublicInstance, VNode, VNodeChild } from 'vue'
import type { ProFieldValueType, ProFieldValueTypeInput } from '../../../utils/typing'
import type { ProFormFieldItemProps, ProFormFieldRuntimeProps } from '../../typing'
import { cloneVNode, computed, defineComponent, h, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useFieldContext } from '../../FieldContext'
import { omitKeys, renderFieldFormItem, renderProField, useRegisterFormItem } from '../_util'

export const proFormFieldPropNames = [
  'addonAfter',
  'addonBefore',
  'addonWarpStyle',
  'allowClear',
  'autoFocus',
  'bordered',
  'cacheForSwr',
  'children',
  'colProps',
  'colSize',
  'convertValue',
  'customLightMode',
  'data',
  'defaultValue',
  'dependencies',
  'dependenciesValues',
  'disabled',
  'emptyText',
  'extra',
  'fieldConfig',
  'fieldProps',
  'footerRender',
  'formItemProps',
  'formItemRender',
  'getFieldProps',
  'getFormItemProps',
  'getValueFromEvent',
  'getValueProps',
  'hasFeedback',
  'help',
  'hidden',
  'htmlFor',
  'ignoreFormItem',
  'initialValue',
  'isDefaultDom',
  'label',
  'labelAlign',
  'labelCol',
  'lightFilterLabelFormatter',
  'messageVariables',
  'mode',
  'name',
  'noStyle',
  'normalize',
  'onChange',
  'originDependencies',
  'params',
  'placement',
  'placeholder',
  'preserve',
  'proFieldProps',
  'proFormFieldKey',
  'readonly',
  'render',
  'request',
  'required',
  'rules',
  'secondary',
  'shouldUpdate',
  'text',
  'tooltip',
  'transform',
  'trigger',
  'validateDebounce',
  'validateFirst',
  'validateStatus',
  'validateTrigger',
  'value',
  'valueEnum',
  'valuePropName',
  'valueType',
  'variant',
  'width',
  'wrapperCol',
]

function toRegisteredValueType(valueType?: ProFieldValueTypeInput): ProFieldValueType {
  if (valueType && typeof valueType === 'object')
    return valueType.type
  return valueType ?? 'text'
}

export function createField<P extends Record<string, any>>(
  Field: Component,
  defaultProps: Partial<P> = {},
) {
  return defineComponent({
    name: 'ProFormWrappedField',
    inheritAttrs: false,
    setup(_props, { attrs, slots, expose }) {
      const innerRef = ref<ComponentPublicInstance | null>(null)
      expose(createRefProxy<ComponentPublicInstance>(innerRef))
      return () => h(Field as any, { ...defaultProps, ...attrs, ref: innerRef }, slots)
    },
  })
}

export function warpField<P extends ProFormFieldRuntimeProps = ProFormFieldRuntimeProps>(
  Field: Component,
  omitFieldProps: string[] = [],
  propNames: readonly string[] = proFormFieldPropNames,
) {
  const Component = defineComponent({
    name: 'ProFormWrappedField',
    inheritAttrs: false,
    props: propNames as any,
    setup(rawProps, { slots, expose }) {
      const fieldContext = useFieldContext()
      const props = rawProps as P
      const mergedProps = computed(() => props)
      const innerRef = ref<ComponentPublicInstance | null>(null)
      expose(createRefProxy<ComponentPublicInstance>(innerRef))
      useRegisterFormItem(() => ({
        ...mergedProps.value,
        valueType: toRegisteredValueType((mergedProps.value as any).valueType),
      }))
      return () => {
        const current = mergedProps.value
        const formItemProps = omitKeys(current, omitFieldProps) as P
        const dom = h(Field as any, { ...current, ref: innerRef }, slots)
        return renderFieldFormItem(
          formItemProps,
          dom,
          (current as any).valueType || 'text',
          fieldContext,
        )
      }
    },
  }) as any
  Component.displayName = 'ProFormComponent'
  return Component
}

export function defineProFormField<P extends Record<string, any> = ProFormFieldRuntimeProps>(
  name: string,
  valueType: ProFieldValueTypeInput | ((props: P) => ProFieldValueTypeInput),
  extraFieldProps?: (props: P) => Record<string, any>,
) {
  const Component = defineComponent({
    name,
    inheritAttrs: false,
    props: proFormFieldPropNames as any,
    setup(rawProps, { slots, expose }) {
      const fieldContext = useFieldContext()
      const props = rawProps as P
      const mergedProps = computed(() => props)
      const innerRef = ref<ComponentPublicInstance | null>(null)
      expose(createRefProxy<ComponentPublicInstance>(innerRef))
      // 注册到 form 的应是「解析后的」valueType（如 dateTime/digit），而非用户透传的 valueType
      // （通常 undefined）。否则 conversionMomentValue/transform 收到错误的 valueType（'text'）。
      const resolvedValueType = computed(() =>
        typeof valueType === 'function' ? valueType(mergedProps.value) : valueType,
      )
      useRegisterFormItem(() => ({
        ...mergedProps.value,
        valueType: toRegisteredValueType(resolvedValueType.value),
      } as ProFormFieldRuntimeProps))
      return () => {
        const current = mergedProps.value
        const child = slots.default?.()
        const resolvedValueType = typeof valueType === 'function' ? valueType(current) : valueType
        const dom: VNodeChild = child?.length
          ? [
              cloneVNode(child[0] as VNode, { ref: innerRef }),
              ...(child.slice(1) as VNode[]),
            ]
          : renderProField(current as ProFormFieldRuntimeProps, resolvedValueType, extraFieldProps?.(current), fieldContext, innerRef)
        return renderFieldFormItem(current as ProFormFieldRuntimeProps, dom, resolvedValueType, fieldContext)
      }
    },
  })
  return Component
}

export default defineProFormField
