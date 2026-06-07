import type { FormProps } from 'antdv-next'
import type { CommonFormProps } from '../../BaseForm'
import type { ProFormGroupProps } from '../../typing'
import { Form } from 'antdv-next'
import { defineComponent } from 'vue'
import BaseForm from '../../BaseForm'
import { EditOrReadOnlyContext } from '../../BaseForm/EditOrReadOnlyContext'
import ProFormItem from '../../components/FormItem'
import Group from '../../components/FormItem/Group'

export type ProFormProps<T = Record<string, any>, U = Record<string, any>>
  = Omit<FormProps, 'onFinish'> & CommonFormProps<T, U>

const ProFormComponent = defineComponent({
  name: 'ProForm',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => (
      <BaseForm
        {...attrs as ProFormProps}
        layout={(attrs as ProFormProps).layout || 'vertical'}
        contentRender={(items: any[], submitter: any) => (
          <>
            {items}
            {submitter}
          </>
        )}
      >
        {slots.default?.()}
      </BaseForm>
    )
  },
}) as any

ProFormComponent.Group = Group
ProFormComponent.useForm = (Form as any).useForm
ProFormComponent.Item = ProFormItem
ProFormComponent.useWatch = (Form as any).useWatch
ProFormComponent.ErrorList = (Form as any).ErrorList
ProFormComponent.Provider = (Form as any).Provider
ProFormComponent.useFormInstance = (Form as any).useFormInstance
ProFormComponent.EditOrReadOnlyContext = EditOrReadOnlyContext

export const ProForm = ProFormComponent
export const ProFormGroup = Group
export type { ProFormGroupProps }
export default ProForm
