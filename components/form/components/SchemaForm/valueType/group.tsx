import ProFormGroup from '../../FormItem/Group'
import type { ProSchemaRenderValueTypeFunction } from '../typing'

export const group: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType !== 'group')
    return true

  if (!item.columns || !Array.isArray(item.columns))
    return null

  return (
    <ProFormGroup
      key={item.key as any}
      title={item.label}
      colProps={item.colProps}
      rowProps={item.rowProps}
      {...(item.getFieldProps?.() || {})}
    >
      {genItems(item.columns)}
    </ProFormGroup>
  )
}
