import type { PropType, VNodeChild } from 'vue'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { Radio } from 'antdv-next'
import { computed, defineComponent, onMounted, watch } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormField from '../Field'
import ProFormItem from '../FormItem'

function getValueByNamePath(model: Record<string, any>, name: NamePath) {
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(model: Record<string, any>, name: NamePath, value: any) {
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, model)
  parent[last] = value
}

const ProFormRadio = defineComponent({
  name: 'ProFormRadio',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    initialValue: { type: null as unknown as PropType<ProFormFieldItemProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormFieldItemProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormFieldItemProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    disabled: { type: Boolean, default: undefined },
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { attrs, emit, slots }) {
    const fieldContext = useFieldContext()

    const checked = computed(() => {
      if (props.fieldProps?.checked !== undefined)
        return props.fieldProps.checked
      if (props.name === undefined)
        return undefined
      return Boolean(getValueByNamePath(fieldContext.model || {}, props.name))
    })

    function setCellValue(value: boolean) {
      if (props.name === undefined)
        return
      setValueByNamePath(fieldContext.model || {}, props.name, value)
    }

    function applyInitialValue() {
      if (props.name === undefined || props.initialValue === undefined)
        return
      if (getValueByNamePath(fieldContext.model || {}, props.name) === undefined)
        setCellValue(Boolean(props.initialValue))
    }

    function handleChange(event: any) {
      setCellValue(Boolean(event?.target?.checked))
      emit('change', event)
      props.fieldProps?.onChange?.(event)
    }

    onMounted(applyInitialValue)
    watch(() => props.initialValue, applyInitialValue)

    return () => {
      const { onChange: _onChange, checked: _checked, defaultChecked, ...fieldProps } = props.fieldProps || {}
      const radioNode = (
        <Radio
          {...attrs}
          {...fieldProps}
          checked={checked.value ?? defaultChecked}
          disabled={props.disabled ?? fieldProps.disabled}
          onChange={handleChange}
        >
          {slots.default?.()}
        </Radio>
      )

      if (props.ignoreFormItem || !props.name)
        return radioNode

      return (
        <ProFormItem
          name={props.name}
          label={props.label}
          tooltip={props.tooltip}
          rules={props.rules}
          required={props.required}
          initialValue={props.initialValue}
          valuePropName="checked"
          valueType="radio"
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            valuePropName: 'checked',
            ...(fieldContext.formItemProps || {}),
            ...(props.formItemProps || {}),
          }}
        >
          {radioNode}
        </ProFormItem>
      )
    }
  },
})

const ProFormRadioGroup = defineComponent({
  name: 'ProFormRadioGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="radio" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

const ProFormRadioButton = defineComponent({
  name: 'ProFormRadioButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ProFormField valueType="radioButton" {...attrs}>
        {slots.default?.()}
      </ProFormField>
    )
  },
})

;(ProFormRadio as any).Group = ProFormRadioGroup
;(ProFormRadio as any).Button = ProFormRadioButton

export default ProFormRadio as typeof ProFormRadio & {
  Group: typeof ProFormRadioGroup
  Button: typeof ProFormRadioButton
}
export { ProFormRadioButton, ProFormRadioGroup }
