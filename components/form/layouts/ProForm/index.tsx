import type { PropType } from 'vue'
import type { ProFormProps } from '../../typing'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import ProFormItem from '../../components/FormItem'
import ProFormGroup from '../../components/FormItem/Group'

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
const ProForm = defineComponent({
  name: 'ProForm',
  inheritAttrs: false,
  props: {
    layout: { type: String as PropType<ProFormProps['layout']>, default: 'vertical' },
  },
  setup(props, { attrs, slots, expose }) {
    const baseRef = shallowRef<any>()
    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      getFieldValue: (name: any) => baseRef.value?.getFieldValue?.(name),
      getFieldsFormatValue: (allData?: true, omitNil?: boolean) => baseRef.value?.getFieldsFormatValue?.(allData, omitNil),
      getFieldFormatValue: (name: any, omitNil?: boolean) => baseRef.value?.getFieldFormatValue?.(name, omitNil),
      getFieldFormatValueObject: (name: any, omitNil?: boolean) => baseRef.value?.getFieldFormatValueObject?.(name, omitNil),
      validateFieldsReturnFormatValue: (nameList?: any[], omitNil?: boolean) => baseRef.value?.validateFieldsReturnFormatValue?.(nameList, omitNil),
      setFieldsValue: (values: Record<string, any>) => baseRef.value?.setFieldsValue?.(values),
    })
    return () => (
      <BaseForm
        ref={baseRef}
        layout={props.layout as any}
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
            ? (slotProps: Record<string, any>) => slots.submitter?.(slotProps)
            : undefined,
        }}
      </BaseForm>
    )
  },
})

;(ProForm as any).Group = ProFormGroup
;(ProForm as any).Item = ProFormItem

export default ProForm as typeof ProForm & { Group: typeof ProFormGroup, Item: typeof ProFormItem }
export { ProForm }
