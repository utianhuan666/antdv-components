import type { FieldMoneyProps } from './components/Money'
import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps } from './types'
import FieldText from './components/Text'
import { createProField } from './ProFieldCore'

export type {
  ProFieldEmptyText,
  ProFieldFC,
  ProFieldLightProps,
  ProFieldPropsType,
  ProFieldValueTypeFunction,
} from './types'
export type ProFieldMoneyProps = FieldMoneyProps

/** Read: empty text placeholder, custom valueType render, fallback to FieldText */
export const pureRenderRead: ProFieldRenderText = (
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
    if (
      typeof dataValue !== 'boolean'
      && typeof dataValue !== 'number'
      && !dataValue
    ) {
      const { fieldProps, render } = props
      if (render) {
        return render(dataValue, { mode, ...fieldProps }, <>{emptyText}</>)
      }
      return <>{emptyText}</>
    }
  }

  const { emptyText: _emptyText, ...propsWithoutEmptyText } = props

  if (typeof valueType === 'object') {
    return pureRenderRead(
      dataValue,
      valueType.type,
      { ...valueType, ...propsWithoutEmptyText } as ProFieldRenderProps,
      valueTypeMap,
    )
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const { ref: _ref, ...customProps } = propsWithoutEmptyText as any
    const readDom = customValueTypeConfig.render?.(
      dataValue,
      { text: dataValue, ...customProps, mode: mode || 'read' } as any,
      <>{dataValue}</>,
    )
    if (props?.render) {
      return props.render(dataValue, { text: dataValue, ...customProps } as any, readDom as any)
    }
    return readDom
  }

  return <FieldText text={dataValue as string} {...propsWithoutEmptyText} />
}

/** Edit: custom valueType formItemRender, fallback to FieldText */
export const pureRenderEdit: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const { emptyText: _emptyText, ...propsWithoutEmptyText } = props

  if (typeof valueType === 'object') {
    return pureRenderEdit(
      dataValue,
      valueType.type,
      { ...valueType, ...propsWithoutEmptyText } as ProFieldRenderProps,
      valueTypeMap,
    )
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const { ref: _ref, ...customProps } = propsWithoutEmptyText as any
    const dom = customValueTypeConfig.formItemRender?.(
      dataValue,
      { text: dataValue, ...customProps } as any,
      <>{dataValue}</>,
    )
    if (props?.formItemRender) {
      return props.formItemRender(dataValue, { text: dataValue, ...customProps } as any, dom as any)
    }
    return dom
  }

  return <FieldText text={dataValue as string} {...propsWithoutEmptyText} />
}

/** Dispatch by mode for callers that use the render helper directly. */
export const pureRenderText: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const m = props.mode ?? 'read'
  return m === 'edit' || m === 'update'
    ? pureRenderEdit(dataValue, valueType, props, valueTypeMap)
    : pureRenderRead(dataValue, valueType, props, valueTypeMap)
}

export const PureProField = createProField(
  { renderRead: pureRenderRead, renderEdit: pureRenderEdit },
  { pickProPropsWithValueTypeMap: false },
)
