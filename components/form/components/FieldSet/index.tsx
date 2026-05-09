import type { PropType, VNode, VNodeChild } from 'vue'
import type { NamePath, ProFormFieldSetProps } from '../../typing'
import { Space } from 'antdv-next'
import { cloneVNode, Comment, computed, defineComponent, Fragment, isVNode, onMounted, Text, watch } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

function defaultGetValueFromEvent(valuePropName: string, ...args: any[]) {
  const event = args[0]
  if (event?.target && valuePropName in event.target)
    return event.target[valuePropName]
  return event
}

function normalizeChildren(children?: VNodeChild): VNode[] {
  if (!Array.isArray(children))
    return isVNode(children) ? [children] : []

  return children.flatMap((node) => {
    if (!isVNode(node))
      return []
    if (node.type === Comment)
      return []
    if (node.type === Text && typeof node.children === 'string' && !node.children.trim())
      return []
    if (node.type === Fragment)
      return normalizeChildren(node.children as VNodeChild)
    return [node]
  })
}

const ProFormFieldSet = defineComponent({
  name: 'ProFormFieldSet',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    valuePropName: { type: String, default: 'value' },
    initialValue: { type: null as unknown as PropType<ProFormFieldSetProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormFieldSetProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormFieldSetProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    value: { type: Array as PropType<any[]>, default: undefined },
    space: { type: Object as PropType<Record<string, any>>, default: undefined },
    type: { type: String as PropType<NonNullable<ProFormFieldSetProps['type']>>, default: 'space' },
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit, slots }) {
    const fieldContext = useFieldContext()

    const values = computed<any[]>(() => {
      if (props.value)
        return props.value
      if (props.name === undefined)
        return []
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const value = path.reduce<any>((acc, key) => acc?.[key], fieldContext.model || {})
      return Array.isArray(value) ? value : []
    })

    function setCellValue(value: any[]) {
      if (props.name === undefined)
        return
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const last = path[path.length - 1]
      if (last === undefined)
        return
      const parent = path.slice(0, -1).reduce<Record<string, any>>((acc, key) => {
        if (!acc[key] || typeof acc[key] !== 'object')
          acc[key] = {}
        return acc[key]
      }, fieldContext.model || {})
      parent[last] = value
    }

    function applyInitialValue() {
      if (props.name === undefined || props.initialValue === undefined || values.value.length > 0)
        return
      setCellValue(props.initialValue)
    }

    function handleFieldSetChange(fieldValue: any, index: number) {
      const nextValues = [...values.value]
      nextValues[index] = defaultGetValueFromEvent(props.valuePropName || 'value', fieldValue)
      setCellValue(nextValues)
      emit('change', nextValues)
      props.fieldProps?.onChange?.(nextValues)
    }

    function renderChildren() {
      let itemIndex = -1
      return normalizeChildren(slots.default?.({ value: values.value, props })).map((node) => {
        itemIndex += 1
        const index = itemIndex
        const nodeProps = (node.props || {}) as Record<string, any>
        const fieldProps = nodeProps.fieldProps || {}
        return cloneVNode(node, {
          key: index,
          ...nodeProps,
          ignoreFormItem: true,
          value: values.value[index],
          fieldProps: {
            ...fieldProps,
            onChange: (...args: any[]) => {
              handleFieldSetChange(args[0], index)
              fieldProps.onChange?.(...args)
            },
          },
        })
      })
    }

    onMounted(applyInitialValue)
    watch(() => props.initialValue, applyInitialValue)

    return () => {
      const spaceProps = { align: 'start' as const, ...(props.space || {}) }
      const children = renderChildren()
      const content = <Space {...spaceProps}>{children}</Space>

      if (props.ignoreFormItem)
        return content

      return (
        <ProFormItem
          name={props.name}
          label={props.label}
          tooltip={props.tooltip}
          rules={props.rules}
          required={props.required}
          initialValue={props.initialValue}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            valuePropName: props.valuePropName,
            ...(fieldContext.formItemProps || {}),
            ...(props.formItemProps || {}),
          }}
        >
          {content}
        </ProFormItem>
      )
    }
  },
})

export default ProFormFieldSet
