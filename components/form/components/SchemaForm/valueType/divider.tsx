import type { ProSchemaRenderValueTypeFunction } from '../typing'
import { Divider } from 'antdv-next'

export const divider: ProSchemaRenderValueTypeFunction = (item) => {
  if (item.valueType !== 'divider')
    return true

  return <Divider key={item.key as any} {...(item.getFieldProps?.() || {})} />
}
