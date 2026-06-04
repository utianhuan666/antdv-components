import type { FormProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormProps as BaseProFormProps, FormData, FormRefLike, NamePath } from '../../typing'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import ProFormItem from '../../components/FormItem'
import ProFormGroup from '../../components/FormItem/Group'

type ProFormLayoutProps<T = FormData, U = FormData> = Omit<FormProps, 'onFinish'> & BaseProFormProps<T, U>
type ProFormPropName = 'layout'

const proFormPropNames: ProFormPropName[] = ['layout']

/**
 * 对标 React `src/form/layouts/ProForm/index.tsx`：
 * 默认使用 vertical 布局，在 BaseForm 基础上注入 contentRender 让 items + submitter 直接顺序排列。
 *
 * 使用方式：
 * ```vue
 * <ProForm @finish="handleFinish">
 *   <ProFormText name="title" label="标题" />
 * </ProForm>
 * ```
 */
const InternalProForm = defineComponent({
  name: 'ProForm',
  inheritAttrs: false,
  props: proFormPropNames,
  setup(rawProps, { attrs, slots, expose }) {
    const props = rawProps as Readonly<Pick<ProFormLayoutProps, typeof proFormPropNames[number]>>
    const baseRef = shallowRef<FormRefLike>()
    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      getFieldValue: (name: NamePath) => baseRef.value?.getFieldValue?.(name),
      getFieldsFormatValue: (allData?: true, omitNil?: boolean) => baseRef.value?.getFieldsFormatValue?.(allData, omitNil),
      getFieldFormatValue: (name: NamePath, omitNil?: boolean) => baseRef.value?.getFieldFormatValue?.(name, omitNil),
      getFieldFormatValueObject: (name: NamePath, omitNil?: boolean) => baseRef.value?.getFieldFormatValueObject?.(name, omitNil),
      validateFieldsReturnFormatValue: (nameList?: NamePath[], omitNil?: boolean) => baseRef.value?.validateFieldsReturnFormatValue?.(nameList, omitNil),
      setFieldsValue: (values: FormData) => baseRef.value?.setFieldsValue?.(values),
    })
    return () => (
      <BaseForm
        ref={baseRef}
        layout={(props.layout ?? 'vertical') as FormProps['layout']}
        contentRender={(items, submitter) => (
          <>
            {items}
            {submitter}
          </>
        )}
        {...attrs}
      >
        {{
          default: () => slots.default?.(),
          submitter: slots.submitter
            ? (slotProps: FormData) => slots.submitter?.(slotProps)
            : undefined,
        }}
      </BaseForm>
    )
  },
})

const ProForm = InternalProForm as unknown as FunctionalComponent<ProFormLayoutProps> & {
  Group: typeof ProFormGroup
  Item: typeof ProFormItem
}

ProForm.Group = ProFormGroup
ProForm.Item = ProFormItem

export default ProForm
export { ProForm }
export type { ProFormLayoutProps }
