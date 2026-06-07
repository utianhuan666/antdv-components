import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps, ProFieldTextType } from './types'
import { pickProProps } from '../utils'
import FieldImage from './components/Image'
import FieldMoney from './components/Money'
import FieldPercent from './components/Percent'
import FieldProgress from './components/Progress'
import { createProField } from './ProFieldCore'
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
  const renderer = ValueTypeToComponentMap[valueType as keyof typeof ValueTypeToComponentMap] ?? ValueTypeToComponentMap.text!
  const renderFn = props.mode === 'edit' || props.mode === 'update'
    ? renderer.formItemRender
    : renderer.render
  return renderFn?.(dataValue, props as any, <>{dataValue as any}</>)
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
        return render(dataValue, { mode, ...fieldProps }, <>{emptyText}</>)
      return <>{emptyText}</>
    }
  }

  const { emptyText: _emptyText, ...propsWithoutEmptyText } = props

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, propsWithoutEmptyText as ProFieldRenderProps)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const { ref: _ref, ...customProps } = propsWithoutEmptyText as any
    return customValueTypeConfig.render?.(
      dataValue,
      { text: dataValue, ...customProps, mode: mode || 'read' } as any,
      <>{dataValue}</>,
    )
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as string, propsWithoutEmptyText as ProFieldRenderProps)
}

/** Edit: context valueTypeMap, built-in valueType */
export const defaultRenderEdit: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const { emptyText: _emptyText, ...propsWithoutEmptyText } = props

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, propsWithoutEmptyText as ProFieldRenderProps)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const { ref: _ref, ...customProps } = propsWithoutEmptyText as any
    return customValueTypeConfig.formItemRender?.(
      dataValue,
      { text: dataValue, ...customProps } as any,
      <>{dataValue}</>,
    )
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as string, propsWithoutEmptyText as ProFieldRenderProps)
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
