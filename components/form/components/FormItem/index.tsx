import type { PropType, VNodeChild } from 'vue'
import type { NamePath, ProFormItemProps } from '../../typing'
import { Col, FormItem } from 'antdv-next'
import { defineComponent } from 'vue'
import { useGridHelpers } from '../../helpers'

/**
 * ProFormItem – 对标 React `src/form/components/FormItem/index.tsx`：
 * 1. 透传 antdv `FormItem` 属性
 * 2. 支持 grid 模式自动包裹 `Col`
 * 3. 提供 valuePropName / convertValue 钩子（最小子集）
 *
 * Vue 端 antdv-next FormItem 默认会捕获 `name` 并通过 v-model 写回 model，
 * 因此我们仍允许子组件自带 onChange 流程；ProFormField 会根据 name 直接写回。
 */
const ProFormItem = defineComponent({
  name: 'ProFormItem',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    extra: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    help: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    colProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormItemProps['convertValue']>>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormItemProps['transform']>>, default: undefined },
    ignoreFormItem: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const { grid, colProps } = useGridHelpers(props.colProps)

    return () => {
      if (props.ignoreFormItem)
        return slots.default?.() ?? null

      const itemNode = (
        <FormItem
          name={props.name as any}
          label={props.label as any}
          tooltip={props.tooltip as any}
          rules={props.rules as any}
          required={props.required}
          extra={props.extra as any}
          help={props.help as any}
          {...(props.formItemProps || {})}
          {...attrs}
        >
          {slots.default?.()}
        </FormItem>
      )

      if (!grid.value)
        return itemNode

      return <Col {...(colProps.value as any)}>{itemNode}</Col>
    }
  },
})

export default ProFormItem
