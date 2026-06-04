import type { ProFormItemProps } from '../../typing'
import { Col, FormItem } from 'antdv-next'
import { defineComponent, onMounted, onUnmounted, watch } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { useGridHelpers } from '../../helpers'
import { proFormItemPropNames } from '../../typing'

/**
 * ProFormItem – 对标 React `src/form/components/FormItem/index.tsx`：
 * 1. 透传 antdv `FormItem` 属性
 * 2. 支持 grid 模式自动包裹 `Col`
 * 3. 提供 valuePropName / convertValue 钩子（最小子集）
 *
 * Vue 端 antdv-next FormItem 默认会捕获 `name` 并通过 v-model 写回 model，
 * 因此我们仍允许子组件自带 onChange 流程；ProFormField 会根据 name 直接写回。
 */
const ProFormItemImpl = defineComponent({
  name: 'ProFormItem',
  inheritAttrs: false,
  props: [...proFormItemPropNames],
  setup(rawProps, { slots, attrs }) {
    const props = rawProps as ProFormItemProps
    const fieldContext = useFieldContext()
    const { grid, colProps } = useGridHelpers(props.colProps)

    function resolveBoolean(value: unknown) {
      if (value === undefined)
        return undefined
      return value === '' || value === true
    }

    function registerFieldValueType() {
      if (!props.name)
        return
      const namePath = Array.isArray(props.name) ? props.name : [props.name]
      fieldContext.setFieldValueType?.(namePath, {
        valueType: props.valueType,
        dateFormat: props.dataFormat,
        transform: props.transform,
      })
    }

    function clearFieldValueType() {
      if (!props.name)
        return
      const namePath = Array.isArray(props.name) ? props.name : [props.name]
      fieldContext.clearFieldValueType?.(namePath)
    }

    onMounted(registerFieldValueType)
    onUnmounted(clearFieldValueType)
    watch(() => [props.name, props.transform] as const, registerFieldValueType)

    return () => {
      if (resolveBoolean(props.ignoreFormItem))
        return slots.default?.() ?? null

      const itemNode = (
        <FormItem
          name={props.name as any}
          label={props.label as any}
          tooltip={props.tooltip as any}
          rules={props.rules as any}
          required={resolveBoolean(props.required)}
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

const ProFormItem = ProFormItemImpl as typeof ProFormItemImpl & {
  new(): { $props: ProFormItemProps }
}

export default ProFormItem
