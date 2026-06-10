import type { FieldMoneyProps } from './components/Money'
import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps } from './types'
import FieldText from './components/Text'
import { createProField } from './ProFieldCore'

type CustomRenderProps = Omit<ProFieldRenderProps, 'ref'> & {
  text: ProFieldRenderProps['text']
}

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

  const propsWithoutEmptyText = { ...props }
  delete propsWithoutEmptyText.emptyText

  if (typeof valueType === 'object') {
    return pureRenderRead(
      dataValue,
      valueType.type,
      {
        ...valueType,
        ...propsWithoutEmptyText,
      } as ProFieldRenderProps,
      valueTypeMap,
    )
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const customProps = { ...propsWithoutEmptyText }
    delete customProps.ref
    const readDom = customValueTypeConfig.render?.(
      dataValue,
      {
        text: dataValue,
        ...customProps,
        mode: mode || 'read',
      } as CustomRenderProps,
      <>{dataValue}</>,
    )
    if (props?.render) {
      return props.render(
        dataValue,
        {
          text: dataValue,
          ...customProps,
        } as CustomRenderProps,
        readDom,
      )
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
  const propsWithoutEmptyText = { ...props }
  delete propsWithoutEmptyText.emptyText

  if (typeof valueType === 'object') {
    return pureRenderEdit(
      dataValue,
      valueType.type,
      {
        ...valueType,
        ...propsWithoutEmptyText,
      } as ProFieldRenderProps,
      valueTypeMap,
    )
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const customProps = { ...propsWithoutEmptyText }
    delete customProps.ref
    const dom = customValueTypeConfig.formItemRender?.(
      dataValue,
      {
        text: dataValue,
        ...customProps,
      } as CustomRenderProps,
      <>{dataValue}</>,
    )
    if (props?.formItemRender) {
      return props.formItemRender(
        dataValue,
        {
          text: dataValue,
          ...customProps,
        } as CustomRenderProps,
        dom,
      )
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
