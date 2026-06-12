import type { BaseFormProps } from '../../BaseForm'
import type { ProFormGroupProps } from '../../typing'
import { Form } from 'antdv-next'
import { defineComponent } from 'vue'
import { BaseForm } from '../../BaseForm'
import { EditOrReadOnlyContext } from '../../BaseForm/EditOrReadOnlyContext'
import ProFormItem from '../../components/FormItem'
import Group from '../../components/FormItem/Group'

export type ProFormProps<T = Record<string, any>, U = Record<string, any>>
  = BaseFormProps<T, U>

const defaultContentRender: NonNullable<BaseFormProps<any, any>['contentRender']> = (items, submitter) => (
  <>
    {items}
    {submitter}
  </>
)

const ProForm = defineComponent<ProFormProps>(
  (props, { slots }) => {
    return () => {
      const { contentRender: customContentRender, layout, ...restProps } = props
      const contentRender = customContentRender ?? defaultContentRender

      return (
        <BaseForm
          {...restProps}
          layout={layout || 'vertical'}
          contentRender={contentRender}
        >
          {slots.default?.()}
        </BaseForm>
      )
    }
  },
  {
    name: 'ProForm',
    inheritAttrs: false,
  },
)

export type { ProFormGroupProps }
export default ProForm
export { EditOrReadOnlyContext, Form, ProFormItem as FormItem, Group }
