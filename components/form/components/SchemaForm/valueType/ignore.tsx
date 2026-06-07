import type { ProSchemaRenderValueTypeFunction } from '../typing'

export const ignore: ProSchemaRenderValueTypeFunction = (item) => {
  if (
    item.valueType
    && typeof item.valueType === 'string'
    && ['index', 'indexBorder', 'option'].includes(item.valueType)
  ) {
    return null
  }
  return true
}

export default ignore
