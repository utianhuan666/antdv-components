import { runFunction } from '../runFunction'

export function getFieldPropsOrFormItemProps(fieldProps: any, form?: any, extraProps?: any): Record<string, any> & { onChange: any, colSize: number } {
  if (form === undefined)
    return fieldProps as any
  return runFunction(fieldProps, form, extraProps)
}
