import type { ProSchemaRenderValueTypeFunction } from '../typing'
import ProFormList from '../../List'

export const formList: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType !== 'formList')
    return true

  if (!item.dataIndex || !item.columns || !Array.isArray(item.columns))
    return null

  return (
    <ProFormList
      {...(item.getFormItemProps?.() || {})}
      key={item.key as any}
      name={item.dataIndex as any}
      label={item.label}
      initialValue={item.initialValue}
      colProps={item.colProps}
      rowProps={item.rowProps}
      {...(item.getFieldProps?.() || {})}
    >
      {() => genItems(item.columns as any)}
    </ProFormList>
  )
}
