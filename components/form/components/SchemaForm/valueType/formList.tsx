import type { ProSchemaRenderValueTypeFunction } from '../typing'
import { ProFormList } from '../../List'

export const formList: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType === 'formList' && item.dataIndex) {
    if (!item.columns || !Array.isArray(item.columns))
      return null

    const listProps = {
      ...item.getFormItemProps?.(),
      key: item.key as any,
      name: item.dataIndex as any,
      label: item.label,
      initialValue: item.initialValue,
      colProps: item.colProps,
      rowProps: item.rowProps,
      ...item.getFieldProps?.(),
    }

    return (
      <ProFormList {...listProps as any}>
        {genItems(item.columns as any)}
      </ProFormList>
    )
  }

  return true
}

export default formList
