import type { ProFieldValueTypeInput } from '../../../utils/typing'
import type { ProFormFieldItemProps } from '../../typing'
import { cloneVNode, defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { mergeFieldProps, renderFieldFormItem, renderProField, useRegisterFormItem } from '../_util'

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
      let dom = children?.length
        ? children
        : renderProField(current, current.valueType || 'text', {}, fieldContext)

      if (children?.length && current.name) {
        const fieldProps = mergeFieldProps(current, {}, fieldContext)
        const firstChild = children[0]
        if (firstChild && typeof firstChild === 'object') {
          dom = [cloneVNode(firstChild, fieldProps), ...children.slice(1)]
        }
      }

      return renderFieldFormItem(current, dom, current.valueType || 'text', fieldContext)
    }
  },
}) as any

ProFormField.displayName = 'ProFormComponent'

export default ProFormField
