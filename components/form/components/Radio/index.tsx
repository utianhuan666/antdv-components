import type { RadioChangeEvent, RadioGroupProps, RadioProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { Radio } from 'antdv-next'
import { computed, defineComponent, onMounted, watch } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormField from '../Field'
import ProFormItem from '../FormItem'

type ModelRecord = Record<string | number, unknown>

export type ProFormRadioProps = ProFormFieldItemProps<RadioProps>

export type ProFormRadioGroupProps = ProFormFieldItemProps<RadioGroupProps> & {
  layout?: 'horizontal' | 'vertical'
  radioType?: 'button' | 'radio'
  options?: RadioGroupProps['options']
}

export type ProFormRadioButtonProps = ProFormFieldItemProps<RadioProps>

interface ProFormRadioEmits {
  change: [event: RadioChangeEvent]
}

const radioPropNames = [
  'name',
  'label',
  'tooltip',
  'rules',
  'required',
  'initialValue',
  'transform',
  'convertValue',
  'formItemProps',
  'fieldProps',
  'disabled',
  'ignoreFormItem',
] satisfies (keyof ProFormRadioProps)[]

function isModelRecord(value: unknown): value is ModelRecord {
  return typeof value === 'object' && value !== null
}

function getValueByNamePath(model: ModelRecord, name: NamePath) {
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<unknown>((current, key) => {
    if (!isModelRecord(current))
      return undefined
    return current[key]
  }, model)
}

function setValueByNamePath(model: ModelRecord, name: NamePath, value: unknown) {
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<ModelRecord>((current, key) => {
    if (!isModelRecord(current[key]))
      current[key] = {}
    return current[key] as ModelRecord
  }, model)
  parent[last] = value
}

const ProFormRadio = defineComponent<ProFormRadioProps, ProFormRadioEmits>((props, { attrs, emit, slots }) => {
  const fieldContext = useFieldContext()
  const model = computed(() => (fieldContext.model || {}) as ModelRecord)

  const checked = computed(() => {
    if (props.fieldProps?.checked !== undefined)
      return props.fieldProps.checked
    if (props.name === undefined)
      return undefined
    return Boolean(getValueByNamePath(model.value, props.name))
  })

  function setCellValue(value: boolean) {
    if (props.name === undefined)
      return
    setValueByNamePath(model.value, props.name, value)
  }

  function applyInitialValue() {
    if (props.name === undefined || props.initialValue === undefined)
      return
    if (getValueByNamePath(model.value, props.name) === undefined)
      setCellValue(Boolean(props.initialValue))
  }

  function handleChange(event: RadioChangeEvent) {
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
}, {
  name: 'ProFormRadio',
  inheritAttrs: false,
  props: radioPropNames,
  emits: ['change'],
})

const ProFormRadioGroup: FunctionalComponent<ProFormRadioGroupProps> = (props, { slots }) => (
  <ProFormField valueType="radio" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormRadioGroup.displayName = 'ProFormRadioGroup'
ProFormRadioGroup.inheritAttrs = false

const ProFormRadioButton: FunctionalComponent<ProFormRadioButtonProps> = (props, { slots }) => (
  <ProFormField valueType="radioButton" {...props}>
    {slots.default?.()}
  </ProFormField>
)

ProFormRadioButton.displayName = 'ProFormRadioButton'
ProFormRadioButton.inheritAttrs = false

const WrappedProFormRadio = ProFormRadio as typeof ProFormRadio & {
  Group: typeof ProFormRadioGroup
  Button: typeof ProFormRadioButton
}

WrappedProFormRadio.Group = ProFormRadioGroup
WrappedProFormRadio.Button = ProFormRadioButton

export default WrappedProFormRadio
export { ProFormRadioButton, ProFormRadioGroup }
