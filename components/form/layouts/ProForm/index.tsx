import type { PropType } from 'vue'
import type { ProFormProps } from '../../typing'
import { defineComponent } from 'vue'
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
    const baseRef = (): any => null
    expose({ baseRef })
    return () => (
      <BaseForm
        layout={props.layout as any}
        contentRender={(items, submitter) => (
          <>
            {items}
            {submitter}
          </>
        )}
        {...attrs}
      >
        {slots.default?.()}
      </BaseForm>
    )
  },
})

;(ProForm as any).Group = ProFormGroup
;(ProForm as any).Item = ProFormItem

export default ProForm as typeof ProForm & { Group: typeof ProFormGroup, Item: typeof ProFormItem }
export { ProForm }
