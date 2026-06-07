import type { Component } from 'vue'
import type { ProFieldValueTypeInput } from '../../../utils/typing'
import type { ProFormFieldItemProps } from '../../typing'
import { computed, defineComponent, h } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { renderFormItem, renderProField, useRegisterFormItem } from '../_util'

export function createField<P extends Record<string, any>>(
  Field: Component,
  defaultProps: Partial<P> = {},
) {
  return defineComponent({
    name: 'ProFormWrappedField',
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => h(Field as any, { ...defaultProps, ...attrs }, slots)
    },
  })
}

export function defineProFormField(
  name: string,
  valueType: ProFieldValueTypeInput | ((props: ProFormFieldItemProps) => ProFieldValueTypeInput),
  extraFieldProps?: (props: ProFormFieldItemProps) => Record<string, any>,
) {
  const Component = defineComponent({
    name,
    inheritAttrs: false,
    setup(props: ProFormFieldItemProps, { attrs, slots }) {
      const fieldContext = useFieldContext()
      const mergedProps = computed(() => ({ ...attrs, ...props }) as ProFormFieldItemProps)
      useRegisterFormItem(() => mergedProps.value)
      return () => {
        const current = mergedProps.value
        const child = slots.default?.()
        const resolvedValueType = typeof valueType === 'function' ? valueType(current) : valueType
        const dom = child?.length
          ? child
          : renderProField(current, resolvedValueType, extraFieldProps?.(current), fieldContext)
        return renderFormItem(current, dom)
      }
    },
  }) as any
  Component.displayName = 'ProFormComponent'
  return Component
}

export default defineProFormField
