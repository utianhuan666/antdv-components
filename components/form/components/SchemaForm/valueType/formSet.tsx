import ProFormFieldSet from '../../FieldSet'
import type { ProSchemaRenderValueTypeFunction } from '../typing'

export const formSet: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType !== 'formSet')
    return true

  if (!item.dataIndex || !item.columns || !Array.isArray(item.columns))
    return null

  return (
    <ProFormFieldSet
      {...(item.getFormItemProps?.() || {})}
      key={item.key as any}
      name={item.dataIndex as any}
      label={item.label}
      initialValue={item.initialValue}
      {...(item.getFieldProps?.() || {})}
    >
      {genItems(item.columns)}
    </ProFormFieldSet>
  )
}
