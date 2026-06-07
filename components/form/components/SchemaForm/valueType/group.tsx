import type { ProSchemaRenderValueTypeFunction } from '../typing'
import { ProFormGroup } from '../../../layouts'

export const group: ProSchemaRenderValueTypeFunction = (item, { genItems }) => {
  if (item.valueType === 'group') {
    if (!item.columns || !Array.isArray(item.columns))
      return null

    return (
      <ProFormGroup
        key={item.key as any}
        label={item.label}
        colProps={item.colProps}
        rowProps={item.rowProps}
        {...item.getFieldProps?.()}
      >
        {genItems(item.columns as any)}
      </ProFormGroup>
    )
  }

  return true
}

export default group
