import type { ProFieldValueTypeInput } from '../../../utils/typing'
import type { ProFormFieldItemProps } from '../../typing'
import { defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { renderFormItem, renderProField, useRegisterFormItem } from '../_util'

export type ProFormFieldProps<
  T = any,
  FieldProps = Record<string, any>,
> = ProFormFieldItemProps<FieldProps> & {
  mode?: 'edit' | 'read' | 'update'
  isDefaultDom?: boolean
  text?: any
  getFieldProps?: () => Record<string, any>
  getFormItemProps?: () => Record<string, any>
  dependenciesValues?: Record<string, any>
  originDependencies?: Record<string, any>
  valueType?: ProFieldValueTypeInput
  data?: T
}

const ProFormField = defineComponent({
  name: 'ProFormField',
  inheritAttrs: false,
  setup(props: ProFormFieldProps, { attrs, slots }) {
    const fieldContext = useFieldContext()
    useRegisterFormItem(() => ({ ...attrs, ...props } as ProFormFieldProps))
    return () => {
      const current = { ...attrs, ...props } as ProFormFieldProps
      const children = slots.default?.()
      const dom = children?.length
        ? children
        : renderProField(current, current.valueType || 'text', {}, fieldContext)
      return renderFormItem(current, dom)
    }
  },
}) as any

ProFormField.displayName = 'ProFormComponent'

export default ProFormField
