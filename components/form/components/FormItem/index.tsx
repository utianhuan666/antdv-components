import type { FormItemProps } from 'antdv-next'
import type { ProFieldValueType, SearchTransformKeyFn } from '../../../utils'
import { cloneVNode, defineComponent } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { mergeFieldProps, renderFormItem, useRegisterFormItem } from '../_util'

export type ProFormItemProps = FormItemProps & {
  ignoreFormItem?: boolean
  valueType?: ProFieldValueType
  transform?: SearchTransformKeyFn
  dataFormat?: string
  proFormFieldKey?: any
  fieldProps?: Record<string, any>
  addonBefore?: any
  addonAfter?: any
  addonWarpStyle?: Record<string, any>
  convertValue?: any
}

const ProFormItem = defineComponent({
  name: 'ProFormItem',
  inheritAttrs: false,
  setup(props: ProFormItemProps, { attrs, slots }) {
    const fieldContext = useFieldContext()
    useRegisterFormItem(() => ({ ...attrs, ...props } as ProFormItemProps))
    return () => {
      const current = { ...attrs, ...props } as ProFormItemProps
      let children = slots.default?.()

      if (children?.length && current.name) {
        const fieldProps = mergeFieldProps(current, {}, fieldContext)
        const firstChild = children[0]
        if (firstChild && typeof firstChild === 'object') {
          children = [cloneVNode(firstChild, fieldProps), ...children.slice(1)]
        }
      }

      return renderFormItem(current, children)
    }
  },
}) as any

ProFormItem.displayName = 'ProFormComponent'

export default ProFormItem
