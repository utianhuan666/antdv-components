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
import { isDropdownValueType, runFunction } from '../../utils'
import { useFieldContext } from '../FieldContext'
import { LightWrapper } from '../layouts/LightFilter/LightWrapper'

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

/**
 * 在 renderFormItem 基础上处理 light 模式：当 proFieldProps.light === true 且非下拉类
 * valueType 时，由 Form.Item 注入 value/onChange，LightWrapper 作为直接 children 承接，
 * 再把 Field 渲染在 Popover 内部（mirror React warpField 的 isLightMode 分支）。
 */
export function renderFieldFormItem(
  props: ProFormFieldItemProps,
  child: VNodeChild,
  valueType: ProFieldValueTypeInput,
  fieldContext: Record<string, any> = {},
) {
  const isLightMode = (props.proFieldProps as any)?.light === true && !(props as any).customLightMode
  const valueTypeStr = typeof valueType === 'string' ? valueType : 'text'
  if (isLightMode && !isDropdownValueType(valueTypeStr)) {
    const valuePropName = props.valuePropName || 'value'
    const lightFieldProps = mergeFieldProps(props, {}, fieldContext)
    const lightValue = getFieldValue(props, lightFieldProps, fieldContext)
    const lightWrapped = (
      <LightWrapper
        label={props.label}
        valuePropName={valuePropName}
        variant={props.variant ?? props.fieldProps?.variant}
        value={lightValue}
        valueType={valueTypeStr}
        placement={props.placement}
        labelFormatter={props.lightFilterLabelFormatter}
        allowClear={props.allowClear}
        footerRender={props.footerRender}
        onChange={(nextValue: any) => {
          if (props.name !== undefined)
            fieldContext.setFieldValue?.(props.name, nextValue)
        }}
      >
        {child}
      </LightWrapper>
    )
    // light 模式下 Form.Item 不展示 label/tooltip，由 FieldLabel 承担
    return renderFormItem({ ...props, label: undefined, tooltip: false } as ProFormFieldItemProps, lightWrapped)
  }
  return renderFormItem(props, child)
}

export function useRegisterFormItem(getProps: () => ProFormFieldItemProps) {
  const fieldContext = useFieldContext()
  // initialValue 只在字段首次注册时写入一次（对齐 React/antd：initialValue 仅做初始填充）。
  // 不能每次 watchEffect 都无条件写回，否则会覆盖用户 setFieldsValue 设置的值
  // （见 protable-reset-params：set 后 submit 仍拿到初始值）。
  // 注意：不要在此读取 model 判定——setFieldValue 内部 replaceValues 会整体重写 model，
  // 若 watchEffect 追踪 model 会触发递归更新。reset 时列级 initialValue 由 BaseForm 的
  // fieldsInitialValues + getMergedInitialValues 同步恢复，无需此处重新填充。
  let initialApplied = false
  watchEffect(() => {
    const props = getProps()
    if (!props.name || !fieldContext.setFieldValueType)
      return
    fieldContext.setFieldValueType(props.name, {
      valueType: props.valueType,
      transform: props.transform,
    })
    if (!initialApplied && props.initialValue !== undefined) {
      initialApplied = true
      // 记录列级 initialValue，供 reset 同步恢复
      ;(fieldContext as any).setFieldInitialValue?.(props.name, props.initialValue)
      fieldContext.setFieldValue?.(props.name, props.initialValue)
    }
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

  // Get value and apply convertValue if present
  let fieldValue = getFieldValue(props, fieldProps, fieldContext)
  if (props.convertValue && fieldValue !== undefined && fieldValue !== null) {
    fieldValue = props.convertValue(fieldValue, props)
  }

  return (
    <ProField
      {...props.proFieldProps}
      text={fieldValue}
      value={fieldValue}
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
