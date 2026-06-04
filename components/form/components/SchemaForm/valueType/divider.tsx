import { Divider } from 'antdv-next'
import type { ProSchemaRenderValueTypeFunction } from '../typing'

export const divider: ProSchemaRenderValueTypeFunction = (item) => {
  if (item.valueType !== 'divider')
    return true

  return <Divider key={item.key as any} {...(item.getFieldProps?.() || {})} />
}
