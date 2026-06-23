import type { ProSchemaRenderValueTypeFunction } from '../typing'
import { Divider as AntDivider } from 'antdv-next'

export const divider: ProSchemaRenderValueTypeFunction = (item) => {
  if (item.valueType === 'divider')
    return <AntDivider {...item.getFieldProps?.()} key={item.key as any} />

  return true
}

export default divider
