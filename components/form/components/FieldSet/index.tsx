import type { VNode, VNodeChild } from 'vue'
import type { ProFormFieldSetProps } from '../../typing'
import { Space } from 'antdv-next'
import { cloneVNode, Comment, computed, defineComponent, Fragment, isVNode, onMounted, Text, watch } from 'vue'
import { useFieldContext } from '../../FieldContext'
import { proFormFieldSetPropNames } from '../../typing'
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

const ProFormFieldSetImpl = defineComponent({
  name: 'ProFormFieldSet',
  inheritAttrs: false,
  props: [...proFormFieldSetPropNames],
  emits: ['change'],
  setup(rawProps, { emit, slots }) {
    const props = rawProps as ProFormFieldSetProps
    const fieldContext = useFieldContext()

    function resolveBoolean(value: unknown) {
      if (value === undefined)
        return undefined
      return value === '' || value === true
    }

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

      if (resolveBoolean(props.ignoreFormItem))
        return content

      return (
        <ProFormItem
          name={props.name}
          label={props.label}
          tooltip={props.tooltip}
          rules={props.rules}
          required={resolveBoolean(props.required)}
          initialValue={props.initialValue}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            valuePropName: props.valuePropName ?? 'value',
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

const ProFormFieldSet = ProFormFieldSetImpl as typeof ProFormFieldSetImpl & {
  new(): { $props: ProFormFieldSetProps }
}

export default ProFormFieldSet
