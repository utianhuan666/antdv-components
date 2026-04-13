import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps } from './types'
import FieldText from './components/Text'
import { createProField } from './ProFieldCore'

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

  delete props.emptyText

  if (typeof valueType === 'object') {
    return pureRenderRead(
      dataValue,
      valueType.type,
      { ...valueType, ...props } as ProFieldRenderProps,
      valueTypeMap,
    )
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

  return <FieldText text={dataValue as string} {...props} />
}

/** Edit: custom valueType formItemRender, fallback to FieldText */
export const pureRenderEdit: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  delete props.emptyText

  if (typeof valueType === 'object') {
    return pureRenderEdit(
      dataValue,
      valueType.type,
      { ...valueType, ...props } as ProFieldRenderProps,
      valueTypeMap,
    )
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

  return <FieldText text={dataValue as string} {...props} />
}

export const PureProField = createProField(
  { renderRead: pureRenderRead, renderEdit: pureRenderEdit },
  { pickProPropsWithValueTypeMap: false },
)
