import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps, ProFieldTextType } from './types'
import FieldImage from './components/Image'
import FieldMoney from './components/Money'
import FieldPercent from './components/Percent'
import FieldProgress from './components/Progress'
import { createProField, pickProProps } from './ProFieldCore'
import ValueTypeToComponentMap from './ValueTypeToComponent'

/** Render by valueType object shorthand */
function defaultRenderTextByObject(
  text: ProFieldTextType,
  valueType: any,
  props: ProFieldRenderProps,
) {
  const pickFormItemProps = pickProProps(props.fieldProps)
  const fieldProps = props as any
  if (valueType.type === 'progress') {
    return <FieldProgress {...fieldProps} text={text as number} fieldProps={{ status: valueType.status, ...pickFormItemProps }} />
  }
  if (valueType.type === 'money') {
    return <FieldMoney locale={valueType.locale} {...fieldProps} fieldProps={pickFormItemProps} text={text as number} moneySymbol={valueType.moneySymbol} />
  }
  if (valueType.type === 'percent') {
    return <FieldPercent {...fieldProps} text={text as number} showSymbol={valueType.showSymbol} precision={valueType.precision} fieldProps={pickFormItemProps} showColor={valueType.showColor} />
  }
  if (valueType.type === 'image') {
    return <FieldImage {...fieldProps} text={text as string} width={valueType.width} />
  }
  return text as any
}

function renderDefaultValueTypeLeaf(dataValue: ProFieldTextType, valueType: string, props: ProFieldRenderProps) {
  const renderer = ValueTypeToComponentMap[valueType] ?? ValueTypeToComponentMap.text!
  const { render, emptyText, ...restProps } = props
  const dom = renderer.render?.(dataValue, restProps as any, <>{dataValue as any}</>)

  if (render && (props.mode ?? 'read') === 'read') {
    return render(
      dataValue,
      { text: dataValue, ...restProps } as any,
      dom as any,
    ) ?? emptyText ?? null
  }

  return dom
}

/** Read: empty text, context valueTypeMap, built-in valueType */
export const defaultRenderRead: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const { mode = 'read', emptyText = '-' } = props

  if (
    emptyText !== false
    && mode === 'read'
    && valueType !== 'option'
    && valueType !== 'switch'
  ) {
    if (typeof dataValue !== 'boolean' && typeof dataValue !== 'number' && !dataValue) {
      const { fieldProps, render } = props
      if (render)
        return render(dataValue, { mode, ...fieldProps }, <>{emptyText}</>) ?? emptyText
      return <>{emptyText}</>
    }
  }

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, props)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const readDom = customValueTypeConfig.render?.(
      dataValue,
      { text: dataValue, ...props, mode: mode || 'read' } as any,
      <>{dataValue}</>,
    )
    if (props?.render) {
      return props.render(dataValue, { text: dataValue, ...props } as any, readDom as any)
    }
    return readDom
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as string, props)
}

/** Edit: context valueTypeMap, built-in valueType */
export const defaultRenderEdit: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, props)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const dom = customValueTypeConfig.formItemRender?.(
      dataValue,
      { text: dataValue, ...props } as any,
      <>{dataValue}</>,
    )
    if (props?.formItemRender) {
      return props.formItemRender(dataValue, { text: dataValue, ...props } as any, dom as any)
    }
    return dom
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as string, props)
}

/** Dispatch by mode (compat) */
export const defaultRenderText: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const m = props.mode ?? 'read'
  return m === 'edit' || m === 'update'
    ? defaultRenderEdit(dataValue, valueType, props, valueTypeMap)
    : defaultRenderRead(dataValue, valueType, props, valueTypeMap)
}

export const ProField = createProField(
  { renderRead: defaultRenderRead, renderEdit: defaultRenderEdit },
  { pickProPropsWithValueTypeMap: true },
)
