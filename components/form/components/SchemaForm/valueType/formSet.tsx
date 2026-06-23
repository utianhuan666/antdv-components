import type { ProSchemaRenderValueTypeFunction } from '../typing'
import ProFormFieldSet from '../../FieldSet'

export const formSet: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType === 'formSet' && item.dataIndex) {
    if (!item.columns || !Array.isArray(item.columns))
      return null

    return (
      <ProFormFieldSet
        {...item.getFormItemProps?.()}
        key={item.key as any}
        initialValue={item.initialValue}
        name={item.dataIndex as any}
        label={item.label}
        colProps={item.colProps}
        rowProps={item.rowProps}
        {...item.getFieldProps?.()}
      >
        {genItems(item.columns as any)}
      </ProFormFieldSet>
    )
  }

  return true
}

export default formSet
