import type { SpaceProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type {
  ProFieldValueTypeInput,
} from '../../utils/typing'
import type { ProFormFieldItemProps } from '../typing'
import { get } from '@v-c/util'
import { FormItem, Space, SpaceCompact } from 'antdv-next'
import { isVNode, watchEffect } from 'vue'
import { ProField } from '../../field'
import { runFunction } from '../../utils'
import { useFieldContext } from '../FieldContext'

export function omitKeys<T extends Record<string, any>>(target: T | undefined, keys: string[]) {
  const next: Record<string, any> = {}
  Object.keys(target || {}).forEach((key) => {
    if (!keys.includes(key))
      next[key] = target![key]
  })
  return next as T
}

export function getValueFromEvent(valuePropName = 'value', ...args: any[]) {
  const event = args[0]
  if (event?.target && valuePropName in event.target)
    return event.target[valuePropName]
  return event
}

function toNamePath(name: any): (string | number)[] | undefined {
  if (name === undefined || name === null)
    return undefined
  return Array.isArray(name) ? name : [name]
}

export function getFieldValue(
  props: ProFormFieldItemProps,
  fieldProps: Record<string, any>,
  fieldContext: Record<string, any> = {},
) {
  const valuePropName = props.valuePropName || 'value'
  if (props.value !== undefined)
    return props.value
  if (fieldProps[valuePropName] !== undefined)
    return fieldProps[valuePropName]
  const namePath = toNamePath(props.name)
  if (namePath && fieldContext.model) {
    const modelValue = get(fieldContext.model, namePath)
    if (modelValue !== undefined)
      return modelValue
  }
  if (props.text !== undefined)
    return props.text
  return props.initialValue ?? props.defaultValue
}

export function mergeFieldProps(
  props: ProFormFieldItemProps,
  extra: Record<string, any> = {},
  fieldContext: Record<string, any> = {},
): Record<string, any> {
  const userFieldProps = props.fieldProps || {}
  const valuePropName = props.valuePropName || 'value'
  const value = getFieldValue(props, userFieldProps, fieldContext)
  const onChange = (...args: any[]) => {
    if (props.name !== undefined && fieldContext.setFieldValue) {
      fieldContext.setFieldValue(props.name, getValueFromEvent(valuePropName, ...args))
    }
    userFieldProps.onChange?.(...args)
    props.onChange?.(...args)
  }

  return {
    ...extra,
    ...userFieldProps,
    ...(value !== undefined ? { [valuePropName]: value } : {}),
    onChange,
  }
}

export function renderFormItem(
  props: ProFormFieldItemProps,
  child: VNodeChild,
  options: { valuePropName?: string, getValueFromEvent?: (...args: any[]) => any } = {},
) {
  const {
    addonAfter,
    addonBefore,
    addonWarpStyle,
    children: _children,
    convertValue: _convertValue,
    fieldConfig: _fieldConfig,
    fieldProps: _fieldProps,
    formItemProps,
    formItemRender: _formItemRender,
    ignoreFormItem,
    mode: _mode,
    onChange: _onChange,
    params: _params,
    proFieldProps: _proFieldProps,
    readonly: _readonly,
    render: _render,
    request: _request,
    text: _text,
    transform: _transform,
    value: _value,
    valueEnum: _valueEnum,
    ...rest
  } = props

  const inner = addonBefore || addonAfter
    ? (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...addonWarpStyle }}>
          {addonBefore ? <div style={{ marginInlineEnd: 8 }}>{addonBefore}</div> : null}
          {child}
          {addonAfter ? <div style={{ marginInlineStart: 8 }}>{addonAfter}</div> : null}
        </div>
      )
    : child

  if (ignoreFormItem)
    return inner

  const AnyFormItem = FormItem as any

  return (
    <AnyFormItem
      {...formItemProps}
      {...rest}
      valuePropName={options.valuePropName || props.valuePropName}
    >
      {inner}
    </AnyFormItem>
  )
}

export function useRegisterFormItem(getProps: () => ProFormFieldItemProps) {
  const fieldContext = useFieldContext()
  watchEffect(() => {
    const props = getProps()
    if (!props.name || !fieldContext.setFieldValueType)
      return
    fieldContext.setFieldValueType(props.name, {
      valueType: props.valueType,
      transform: props.transform,
    })
    if (props.initialValue !== undefined)
      fieldContext.setFieldValue?.(props.name, props.initialValue)
  })
}

export function renderProField(
  props: ProFormFieldItemProps,
  valueType: ProFieldValueTypeInput,
  extraFieldProps: Record<string, any> = {},
  fieldContext: Record<string, any> = {},
) {
  const fieldProps = mergeFieldProps(props, extraFieldProps, fieldContext)
  const mode = props.readonly
    ? 'read'
    : props.proFieldProps?.mode || props.mode || 'edit'

  return (
    <ProField
      {...props.proFieldProps}
      text={getFieldValue(props, fieldProps, fieldContext)}
      value={props.value}
      valueType={valueType}
      mode={mode}
      readonly={props.readonly}
      fieldProps={fieldProps}
      valueEnum={runFunction(props.valueEnum)}
      request={props.request}
      params={props.params}
      placeholder={props.placeholder ?? fieldProps.placeholder}
      render={props.render as any}
      formItemRender={props.formItemRender as any}
    />
  )
}

export function renderChildren(children: VNodeChild | ((...args: any[]) => VNodeChild), ...args: any[]) {
  return typeof children === 'function' ? children(...args) : children
}

export function toVNodeArray(children: VNodeChild) {
  if (children === null || children === undefined || typeof children === 'boolean')
    return []
  return (Array.isArray(children) ? children : [children]).flatMap((item: any) =>
    Array.isArray(item) ? item : [item],
  )
}

export function isElementVNode(node: any) {
  return isVNode(node) && typeof node.type !== 'symbol'
}

export function renderSpace(children: VNodeChild, spaceProps?: SpaceProps, compact = false) {
  const Comp = (compact ? SpaceCompact : Space) as any
  return (
    <Comp {...spaceProps} align={spaceProps?.align || 'start'}>
      {children}
    </Comp>
  )
}
